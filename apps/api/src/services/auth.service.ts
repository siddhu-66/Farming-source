import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { supabase } from '../config/supabase';
import authRepo from '../repositories/auth.repository';
import { AuthenticationError, BusinessRuleError, DatabaseError, NotFoundError } from '../utils/errors';
import { sendEmail } from './email';
import trustedDevicesRepo from '../repositories/trusted_devices.repository';
import loginHistoryRepo from '../repositories/login_history.repository';
import securityService from './security.service';
import { twilioVerifyService } from './twilio_verify.service';
import { normalizeToE164, maskPhoneNumber } from '../utils/phone';
import { logger } from '../config/logger';

// The registration schema requires a password. Keep this guard in the service as
// well so callers cannot bypass validation and silently receive a known password.
const requireRegistrationPassword = (password: unknown): string => {
  if (typeof password !== 'string' || password.length < 6) {
    throw new BusinessRuleError('A valid registration password is required');
  }
  return password;
};

const generateAccessToken = (user: any, sessionId?: string, deviceId?: string): string => {
  const secret = process.env.JWT_SECRET!;
  return jwt.sign({ userId: user.id.toString(), role: user.role, email: user.email, sessionId, deviceId }, secret, { expiresIn: (process.env.JWT_EXPIRES_IN || '15m') as any });
};

const generateRefreshToken = (user: any): string => {
  const secret = process.env.JWT_REFRESH_SECRET!;
  return jwt.sign({ userId: user.id.toString(), role: user.role }, secret, { expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as any });
};

export const mapUserToCamelCase = (user: any) => {
  if (!user) return user;
  const mapped = { ...user };
  const keyMap: Record<string, string> = { public_id: 'publicId', full_name: 'fullName', phone: 'phone', password_hash: 'passwordHash', status: 'accountStatus', is_email_verified: 'isEmailVerified', is_mobile_verified: 'isMobileVerified', is_phone_verified: 'isPhoneVerified', profile_completed: 'profileCompleted', profile_photo: 'profilePhoto', preferred_language: 'preferredLanguage', last_login: 'lastLoginAt', last_password_changed_at: 'lastPasswordChangedAt', account_locked_until: 'accountLockedUntil', is_deleted: 'isDeleted', deleted_at: 'deletedAt', deleted_by: 'deletedBy', created_by: 'createdBy', updated_by: 'updatedBy', created_at: 'createdAt', updated_at: 'updatedAt' };
  for (const [snake, camel] of Object.entries(keyMap)) if (snake in mapped) { mapped[camel] = mapped[snake]; delete mapped[snake]; }
  return mapped;
};

export const isUserVerified = (user: any): boolean => !!user && (user.status === 'ACTIVE' || user.is_mobile_verified === true || user.is_phone_verified === true || user.is_email_verified === true || user.verified === true);

export const getWelcomeEmailTemplate = (name: string, verificationUrl: string): string => `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;"><h2 style="color: #2e7d32;">Welcome to AgriAssist, ${name}!</h2><p>Thank you for registering with AgriAssist. Please verify your email address to complete your profile setup.</p><div style="margin: 24px 0;"><a href="${verificationUrl}" style="background-color: #2e7d32; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Verify Email Address</a></div><p style="color: #666; font-size: 12px;">If you did not register for AgriAssist, you can safely ignore this email.</p></div>`;

export const checkUserAvailability = async (email?: string, phone?: string) => {
  let emailAvailable = true, phoneAvailable = true, emailMessage = '', phoneMessage = '';
  const cleanEmail = email ? email.toLowerCase().trim() : undefined;
  let normalizedPhone: string | undefined;
  if (phone) { try { normalizedPhone = normalizeToE164(phone); } catch { normalizedPhone = phone.trim(); } }
  const existingUserByEmail = cleanEmail ? await authRepo.getUserByEmail(cleanEmail) : null;
  const existingUserByPhone = normalizedPhone ? await authRepo.getUserByPhone(normalizedPhone) : null;
  if (existingUserByEmail && isUserVerified(existingUserByEmail)) { emailAvailable = false; emailMessage = 'This email is already registered. Please log in instead.'; }
  if (existingUserByPhone && isUserVerified(existingUserByPhone)) { phoneAvailable = false; phoneMessage = 'This mobile number is already registered. Please log in instead.'; }
  const available = emailAvailable && phoneAvailable;
  const message = !emailAvailable && !phoneAvailable ? 'This email and mobile number are already registered. Please log in instead.' : !emailAvailable ? emailMessage : !phoneAvailable ? phoneMessage : '';
  return { available, emailAvailable, phoneAvailable, emailMessage, phoneMessage, message };
};

export const saveRegistrationDraft = async (draftData: any) => {
  if (!draftData || typeof draftData !== 'object' || Array.isArray(draftData)) {
    throw new BusinessRuleError('Invalid registration draft');
  }
  const role = typeof draftData.role === 'string' ? draftData.role.toUpperCase() : '';
  if (!role) throw new BusinessRuleError('Registration role is required');

  // Registration passwords must never be persisted in plaintext, including in a draft.
  const payload = JSON.parse(JSON.stringify(draftData));
  if (payload.account && typeof payload.account === 'object') {
    delete payload.account.password;
    delete payload.account.passwordHash;
    delete payload.account.password_hash;
  }

  const { data, error } = await supabase
    .from('registration_drafts')
    .insert({ role, payload })
    .select('id, role, expires_at, created_at, updated_at')
    .single();
  if (error) {
    logger.error('Failed to persist registration draft', { error: error.message, code: error.code });
    throw new DatabaseError('Unable to save registration draft');
  }
  return data;
};

export const registerUser = async (data: any, requestMeta: any = {}) => {
  const pInfo = data.personalInfo || {};
  const acc = data.account || {};
  const prof = data.profile || {};
  const cleanEmail = pInfo.email ? pInfo.email.toLowerCase().trim() : null;
  const rawPhone = pInfo.phone ? pInfo.phone.trim() : null;
  if (!rawPhone) throw new BusinessRuleError('Mobile number is required');
  const normalizedPhone = normalizeToE164(rawPhone);
  const existingUserByEmail = cleanEmail ? await authRepo.getUserByEmail(cleanEmail) : null;
  const existingUserByPhone = await authRepo.getUserByPhone(normalizedPhone);
  if (existingUserByEmail && isUserVerified(existingUserByEmail)) throw new BusinessRuleError('This email is already registered. Please log in instead.');
  if (existingUserByPhone && isUserVerified(existingUserByPhone)) throw new BusinessRuleError('This mobile number is already registered. Please log in instead.');

  const password = requireRegistrationPassword(acc.password);
  const hashedPassword = await bcrypt.hash(password, 10);
  const fullName = `${pInfo.firstName || ''} ${pInfo.lastName || ''}`.trim() || 'User';
  let user: any;
  const commonUpdates = { full_name: fullName, email: cleanEmail, phone: normalizedPhone, password_hash: hashedPassword, role: data.role.toUpperCase(), preferred_language: prof.language || 'English', status: 'PENDING', is_email_verified: false, is_mobile_verified: false, is_phone_verified: false, verified: false };

  if (existingUserByEmail && existingUserByPhone && existingUserByEmail.id === existingUserByPhone.id) user = await authRepo.updateUser(existingUserByEmail.id, commonUpdates);
  else if (existingUserByEmail && existingUserByPhone && existingUserByEmail.id !== existingUserByPhone.id) { await authRepo.deleteUserById(existingUserByEmail.id); user = await authRepo.updateUser(existingUserByPhone.id, commonUpdates); }
  else if (existingUserByEmail && !existingUserByPhone) user = await authRepo.updateUser(existingUserByEmail.id, commonUpdates);
  else if (existingUserByPhone && !existingUserByEmail) user = await authRepo.updateUser(existingUserByPhone.id, commonUpdates);
  else user = await authRepo.createUser({ full_name: fullName, email: cleanEmail, phone: normalizedPhone, password_hash: hashedPassword, role: data.role.toUpperCase(), preferred_language: prof.language || 'English', timezone: 'Asia/Kolkata' });

  await authRepo.createRoleProfile(data.role, user.id);
  logger.info(`[Auth] Initiating Twilio Verify SMS verification for ${normalizedPhone}`);
  const twilioResult = await twilioVerifyService.startVerification(normalizedPhone, 'sms');
  if (user.email) {
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/verify-email?token=${verificationToken}&id=${user.id}`;
    try { await sendEmail({ to: user.email, subject: 'Welcome to AgriAssist — Verify Your Email', html: getWelcomeEmailTemplate(user.full_name, verificationUrl) }); }
    catch (err) { logger.warn('Failed to send verification email (non-fatal):', err); }
  }
  return { user: mapUserToCamelCase(user), verificationSid: twilioResult.sid, phone: normalizedPhone, maskedPhone: maskPhoneNumber(normalizedPhone), message: 'Registration initiated. Verification code sent via SMS.' };
};

export const loginUser = async (data: any, requestMeta: any = {}) => {
  let user;
  try {
    if (data.email) user = await authRepo.getUserByEmail(data.email);
    else if (data.phone) user = await authRepo.getUserByPhone(normalizeToE164(data.phone));
    if (!user) { await loginHistoryRepo.recordLoginAttempt({ ...requestMeta, loginType: 'LOGIN', authenticationMethod: 'PASSWORD', loginStatus: 'FAILED', failureReason: 'USER_NOT_FOUND', isSuccessful: false, metadata: { attemptedEmail: data.email } }); await securityService.logFailedLogin(null, requestMeta, 'USER_NOT_FOUND'); throw new AuthenticationError('Invalid credentials'); }
    const isMatch = await bcrypt.compare(data.password, user.password_hash);
    if (!isMatch) { await authRepo.updateUser(user.id, {}); await loginHistoryRepo.recordLoginAttempt({ ...requestMeta, userId: user.id, loginType: 'LOGIN', authenticationMethod: 'PASSWORD', loginStatus: 'FAILED', failureReason: 'INVALID_PASSWORD', isSuccessful: false }); await securityService.logFailedLogin(user.id, requestMeta, 'INVALID_PASSWORD'); throw new AuthenticationError('Invalid credentials'); }
    if (user.status !== 'ACTIVE') { await loginHistoryRepo.recordLoginAttempt({ ...requestMeta, userId: user.id, loginType: 'LOGIN', authenticationMethod: 'PASSWORD', loginStatus: 'FAILED', failureReason: 'ACCOUNT_DISABLED', isSuccessful: false }); await securityService.logFailedLogin(user.id, requestMeta, 'ACCOUNT_DISABLED'); throw new AuthenticationError('Account is pending verification or disabled'); }
    user.last_login = new Date().toISOString(); await authRepo.updateUser(user.id, { last_login: user.last_login });
    const fingerprintRaw = `${requestMeta.browser || 'Unknown'}|${requestMeta.operatingSystem || 'Unknown'}|${requestMeta.platform || 'Unknown'}|${requestMeta.screenResolution || 'Unknown'}|${requestMeta.timezone || 'Unknown'}|${requestMeta.language || 'Unknown'}|${requestMeta.userAgent || 'Unknown'}|${requestMeta.deviceType || 'Unknown'}`;
    const deviceFingerprint = crypto.createHash('sha256').update(fingerprintRaw).digest('hex');
    let isNewDevice = false;
    let device = await trustedDevicesRepo.findDeviceByFingerprint(user.id, deviceFingerprint);
    if (!device) { device = await trustedDevicesRepo.registerDevice(user.id, deviceFingerprint, requestMeta); isNewDevice = true; await securityService.logNewDeviceLogin(user.id, device.id, requestMeta); }
    requestMeta.deviceId = device.id;
    const sessionRecord = await authRepo.createSession(user.id, requestMeta);
    const rft = await require('../repositories/refresh_tokens.repository').default.issueToken({ userId: user.id, sessionId: sessionRecord.id, ...requestMeta });
    await authRepo.linkRefreshTokenToSession(sessionRecord.id, rft.record.id);
    const accessToken = generateAccessToken(user, sessionRecord.id, device.id);
    await trustedDevicesRepo.updateDeviceLogin(device.id, true, sessionRecord.id, rft.record.id);
    await loginHistoryRepo.recordLoginAttempt({ ...requestMeta, userId: user.id, sessionId: sessionRecord.id, refreshTokenId: rft.record.id, deviceId: device.id, loginType: 'LOGIN', authenticationMethod: 'PASSWORD', loginStatus: 'SUCCESS', isSuccessful: true, isTrustedDevice: device.is_trusted, riskScore: isNewDevice ? 25 : 0 });
    const secret = process.env.JWT_REFRESH_SECRET!;
    const refreshToken = jwt.sign({ userId: user.id.toString(), jti: rft.jwtId, raw: rft.rawToken }, secret, { expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '30d') as any });
    return { user: mapUserToCamelCase(user), accessToken, refreshToken };
  } catch (error) { throw error; }
};

export const refreshTokens = async (refreshToken: string, requestMeta: any = {}) => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) throw new AuthenticationError('Refresh service is not configured');
  let decoded: any;
  try { decoded = jwt.verify(refreshToken, secret, { algorithms: ['HS256'] }); } catch { throw new AuthenticationError('Invalid or expired refresh token'); }
  if (!decoded?.userId || !decoded?.jti || !decoded?.raw) throw new AuthenticationError('Invalid refresh token claims');
  const rotated = await require('../repositories/refresh_tokens.repository').default.rotateToken(decoded.userId, decoded.jti, decoded.raw, requestMeta);
  if (!rotated?.userId || rotated.userId !== decoded.userId) throw new AuthenticationError('Refresh token is no longer valid');
  const user = await authRepo.getUserById(decoded.userId);
  if (!user || user.is_deleted || user.status !== 'ACTIVE') throw new AuthenticationError('Account is no longer active');
  const sessionId = rotated.record?.session_id;
  const accessToken = generateAccessToken(user, sessionId, rotated.record?.device_id);
  const nextRefresh = jwt.sign({ userId: user.id.toString(), jti: rotated.jwtId, raw: rotated.rawToken }, secret, { expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '30d') as any });
  return { user: mapUserToCamelCase(user), accessToken, refreshToken: nextRefresh };
};

export const verifyOTP = async (phone: string, otp: string, purpose: string = 'VERIFY', requestMeta: any = {}) => {
  const normalizedPhone = normalizeToE164(phone);
  const result = await twilioVerifyService.checkVerification(normalizedPhone, otp);
  if (!result.valid) throw new AuthenticationError('Invalid or expired verification code');
  const user = await authRepo.getUserByPhone(normalizedPhone);
  if (!user) throw new NotFoundError('User not found');
  await authRepo.updateUser(user.id, { status: 'ACTIVE', is_mobile_verified: true, is_phone_verified: true });
  const sessionRecord = await authRepo.createSession(user.id, { ...requestMeta, loginMethod: 'otp' });
  const rft = await require('../repositories/refresh_tokens.repository').default.issueToken({ userId: user.id, sessionId: sessionRecord.id, ...requestMeta });
  await authRepo.linkRefreshTokenToSession(sessionRecord.id, rft.record.id);
  const accessToken = generateAccessToken(user, sessionRecord.id);
  const secret = process.env.JWT_REFRESH_SECRET!;
  const refreshToken = jwt.sign({ userId: user.id.toString(), jti: rft.jwtId, raw: rft.rawToken }, secret, { expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '30d') as any });
  return { user: mapUserToCamelCase({ ...user, status: 'ACTIVE', is_mobile_verified: true, is_phone_verified: true }), accessToken, refreshToken };
};