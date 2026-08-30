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

const generateAccessToken = (user: any, sessionId?: string, deviceId?: string): string => {
  const secret = process.env.JWT_SECRET!;
  return jwt.sign(
    { userId: user.id.toString(), role: user.role, email: user.email, sessionId, deviceId },
    secret,
    { expiresIn: (process.env.JWT_EXPIRES_IN || '15m') as any }
  );
};

const generateRefreshToken = (user: any): string => {
  const secret = process.env.JWT_REFRESH_SECRET!;
  return jwt.sign(
    { userId: user.id.toString(), role: user.role },
    secret,
    { expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as any }
  );
};

export const mapUserToCamelCase = (user: any) => {
  if (!user) return user;
  const mapped = { ...user };

  const keyMap: Record<string, string> = {
    'public_id': 'publicId',
    'full_name': 'fullName',
    'phone': 'phone',
    'password_hash': 'passwordHash',
    'status': 'accountStatus',
    'is_email_verified': 'isEmailVerified',
    'is_mobile_verified': 'isMobileVerified',
    'profile_completed': 'profileCompleted',
    'profile_photo': 'profilePhoto',
    'preferred_language': 'preferredLanguage',
    'last_login': 'lastLoginAt',
    'last_password_changed_at': 'lastPasswordChangedAt',
    'account_locked_until': 'accountLockedUntil',
    'is_deleted': 'isDeleted',
    'deleted_at': 'deletedAt',
    'deleted_by': 'deletedBy',
    'created_by': 'createdBy',
    'updated_by': 'updatedBy',
    'created_at': 'createdAt',
    'updated_at': 'updatedAt'
  };

  for (const [snake, camel] of Object.entries(keyMap)) {
    if (snake in mapped) {
      mapped[camel] = mapped[snake];
      delete mapped[snake];
    }
  }

  return mapped;
};

export const isUserVerified = (user: any): boolean => {
  if (!user) return false;
  return (
    user.status === 'ACTIVE' ||
    user.is_mobile_verified === true ||
    user.is_phone_verified === true ||
    user.is_email_verified === true ||
    user.verified === true
  );
};

export const getWelcomeEmailTemplate = (name: string, verificationUrl: string): string => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
    <h2 style="color: #2e7d32;">Welcome to AgriAssist, ${name}!</h2>
    <p>Thank you for registering with AgriAssist. Please verify your email address to complete your profile setup.</p>
    <div style="margin: 24px 0;">
      <a href="${verificationUrl}" style="background-color: #2e7d32; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Verify Email Address</a>
    </div>
    <p style="color: #666; font-size: 12px;">If you did not register for AgriAssist, you can safely ignore this email.</p>
  </div>
`;

export const checkUserAvailability = async (email?: string, phone?: string) => {
  let emailAvailable = true;
  let phoneAvailable = true;
  let emailMessage = '';
  let phoneMessage = '';

  const cleanEmail = email ? email.toLowerCase().trim() : undefined;
  let normalizedPhone: string | undefined;
  if (phone) {
    try {
      normalizedPhone = normalizeToE164(phone);
    } catch {
      normalizedPhone = phone.trim();
    }
  }

  let existingUserByEmail = null;
  let existingUserByPhone = null;

  if (cleanEmail) {
    existingUserByEmail = await authRepo.getUserByEmail(cleanEmail);
    if (existingUserByEmail && isUserVerified(existingUserByEmail)) {
      emailAvailable = false;
      emailMessage = 'This email is already registered. Please log in instead.';
    }
  }

  if (normalizedPhone) {
    existingUserByPhone = await authRepo.getUserByPhone(normalizedPhone);
    if (existingUserByPhone && isUserVerified(existingUserByPhone)) {
      phoneAvailable = false;
      phoneMessage = 'This mobile number is already registered. Please log in instead.';
    }
  }

  const available = emailAvailable && phoneAvailable;
  let message = '';
  if (!emailAvailable && !phoneAvailable) {
    message = 'This email and mobile number are already registered. Please log in instead.';
  } else if (!emailAvailable) {
    message = emailMessage;
  } else if (!phoneAvailable) {
    message = phoneMessage;
  }

  return {
    available,
    emailAvailable,
    phoneAvailable,
    emailMessage,
    phoneMessage,
    message
  };
};

export const saveRegistrationDraft = async (draftData: any) => {
  logger.info(`Saved registration draft for role: ${draftData.role}`);
  return true;
};

export const registerUser = async (data: any, requestMeta: any = {}) => {
  const pInfo = data.personalInfo || {};
  const acc = data.account || {};
  const prof = data.profile || {};

  const cleanEmail = pInfo.email ? pInfo.email.toLowerCase().trim() : null;
  const rawPhone = pInfo.phone ? pInfo.phone.trim() : null;

  if (!rawPhone) {
    throw new BusinessRuleError('Mobile number is required');
  }

  // 1. Normalize mobile number to standard E.164 (+[country code][number])
  const normalizedPhone = normalizeToE164(rawPhone);

  // 2. Check existing users by email and phone
  const existingUserByEmail = cleanEmail ? await authRepo.getUserByEmail(cleanEmail) : null;
  const existingUserByPhone = await authRepo.getUserByPhone(normalizedPhone);

  // 3. Reject if email or mobile already belongs to an existing VERIFIED account
  if (existingUserByEmail && isUserVerified(existingUserByEmail)) {
    throw new BusinessRuleError('This email is already registered. Please log in instead.');
  }

  if (existingUserByPhone && isUserVerified(existingUserByPhone)) {
    throw new BusinessRuleError('This mobile number is already registered. Please log in instead.');
  }

  // 4. Prepare user details
  const hashedPassword = await bcrypt.hash(acc.password || 'TemporaryPass123!', 10);
  const fullName = `${pInfo.firstName || ''} ${pInfo.lastName || ''}`.trim() || 'User';

  let user: any;

  // Case A: Both email and phone point to the same existing unverified pending user -> Reuse in-place
  if (
    existingUserByEmail &&
    existingUserByPhone &&
    existingUserByEmail.id === existingUserByPhone.id
  ) {
    logger.info(`Reusing existing pending registration for user ${existingUserByEmail.id}`);
    user = await authRepo.updateUser(existingUserByEmail.id, {
      full_name: fullName,
      email: cleanEmail,
      phone: normalizedPhone,
      password_hash: hashedPassword,
      role: data.role.toUpperCase(),
      preferred_language: prof.language || 'English',
      status: 'PENDING',
      is_email_verified: false,
      is_mobile_verified: false,
      is_phone_verified: false,
      verified: false
    });
  }
  // Case B: Email and phone point to two different unverified pending users -> Clean up one, update other
  else if (
    existingUserByEmail &&
    existingUserByPhone &&
    existingUserByEmail.id !== existingUserByPhone.id
  ) {
    logger.info(`Cleaning up conflicting pending registration ${existingUserByEmail.id} and updating ${existingUserByPhone.id}`);
    await authRepo.deleteUserById(existingUserByEmail.id);
    user = await authRepo.updateUser(existingUserByPhone.id, {
      full_name: fullName,
      email: cleanEmail,
      phone: normalizedPhone,
      password_hash: hashedPassword,
      role: data.role.toUpperCase(),
      preferred_language: prof.language || 'English',
      status: 'PENDING',
      is_email_verified: false,
      is_mobile_verified: false,
      is_phone_verified: false,
      verified: false
    });
  }
  // Case C: Only unverified user by email exists -> Update with new details & phone
  else if (existingUserByEmail && !existingUserByPhone) {
    logger.info(`Updating unverified pending user by email ${existingUserByEmail.id}`);
    user = await authRepo.updateUser(existingUserByEmail.id, {
      full_name: fullName,
      email: cleanEmail,
      phone: normalizedPhone,
      password_hash: hashedPassword,
      role: data.role.toUpperCase(),
      preferred_language: prof.language || 'English',
      status: 'PENDING',
      is_email_verified: false,
      is_mobile_verified: false,
      is_phone_verified: false,
      verified: false
    });
  }
  // Case D: Only unverified user by phone exists -> Update with new details & email
  else if (existingUserByPhone && !existingUserByEmail) {
    logger.info(`Updating unverified pending user by phone ${existingUserByPhone.id}`);
    user = await authRepo.updateUser(existingUserByPhone.id, {
      full_name: fullName,
      email: cleanEmail,
      phone: normalizedPhone,
      password_hash: hashedPassword,
      role: data.role.toUpperCase(),
      preferred_language: prof.language || 'English',
      status: 'PENDING',
      is_email_verified: false,
      is_mobile_verified: false,
      is_phone_verified: false,
      verified: false
    });
  }
  // Case E: New user (neither exists)
  else {
    const insertData = {
      full_name: fullName,
      email: cleanEmail,
      phone: normalizedPhone,
      password_hash: hashedPassword,
      role: data.role.toUpperCase(),
      preferred_language: prof.language || 'English',
      timezone: 'Asia/Kolkata',
    };
    user = await authRepo.createUser(insertData);
  }

  // Ensure role profile exists
  await authRepo.createRoleProfile(data.role, user.id);

  // 5. Dispatch SMS OTP exclusively via Twilio Verify API v2
  logger.info(`[Auth] Initiating Twilio Verify SMS verification for ${normalizedPhone}`);
  const twilioResult = await twilioVerifyService.startVerification(normalizedPhone, 'sms');

  // Optional: Send email verification if email provided
  if (user.email) {
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/verify-email?token=${verificationToken}&id=${user.id}`;
    try {
      await sendEmail({
        to: user.email,
        subject: 'Welcome to AgriAssist — Verify Your Email',
        html: getWelcomeEmailTemplate(user.full_name, verificationUrl),
      });
    } catch (err) {
      logger.warn('Failed to send verification email (non-fatal):', err);
    }
  }

  const userCamel = mapUserToCamelCase(user);
  return {
    user: userCamel,
    verificationSid: twilioResult.sid,
    phone: normalizedPhone,
    maskedPhone: maskPhoneNumber(normalizedPhone),
    message: 'Registration initiated. Verification code sent via SMS.'
  };
};

export const loginUser = async (data: any, requestMeta: any = {}) => {
  let user;
  try {
    if (data.email) {
      user = await authRepo.getUserByEmail(data.email);
    } else if (data.phone) {
      const normalizedPhone = normalizeToE164(data.phone);
      user = await authRepo.getUserByPhone(normalizedPhone);
    }

    if (!user) {
      await loginHistoryRepo.recordLoginAttempt({
        ...requestMeta,
        loginType: 'LOGIN',
        authenticationMethod: 'PASSWORD',
        loginStatus: 'FAILED',
        failureReason: 'USER_NOT_FOUND',
        isSuccessful: false,
        metadata: { attemptedEmail: data.email }
      });
      await securityService.logFailedLogin(null, requestMeta, 'USER_NOT_FOUND');
      throw new AuthenticationError('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(data.password, user.password_hash);
    if (!isMatch) {
      await authRepo.updateUser(user.id, {});
      await loginHistoryRepo.recordLoginAttempt({
        ...requestMeta,
        userId: user.id,
        loginType: 'LOGIN',
        authenticationMethod: 'PASSWORD',
        loginStatus: 'FAILED',
        failureReason: 'INVALID_PASSWORD',
        isSuccessful: false
      });
      await securityService.logFailedLogin(user.id, requestMeta, 'INVALID_PASSWORD');
      throw new AuthenticationError('Invalid credentials');
    }

    if (user.status !== 'ACTIVE') {
      await loginHistoryRepo.recordLoginAttempt({
        ...requestMeta,
        userId: user.id,
        loginType: 'LOGIN',
        authenticationMethod: 'PASSWORD',
        loginStatus: 'FAILED',
        failureReason: 'ACCOUNT_DISABLED',
        isSuccessful: false
      });
      await securityService.logFailedLogin(user.id, requestMeta, 'ACCOUNT_DISABLED');
      throw new AuthenticationError('Account is pending verification or disabled');
    }

    user.last_login = new Date().toISOString();
    await authRepo.updateUser(user.id, {
      last_login: user.last_login,
    });

    // Fingerprinting & Device Registration
    const fingerprintRaw = `${requestMeta.browser || 'Unknown'}|${requestMeta.operatingSystem || 'Unknown'}|${requestMeta.platform || 'Unknown'}|${requestMeta.screenResolution || 'Unknown'}|${requestMeta.timezone || 'Unknown'}|${requestMeta.language || 'Unknown'}|${requestMeta.userAgent || 'Unknown'}|${requestMeta.deviceType || 'Unknown'}`;
    const deviceFingerprint = crypto.createHash('sha256').update(fingerprintRaw).digest('hex');

    let isNewDevice = false;
    let device = await trustedDevicesRepo.findDeviceByFingerprint(user.id, deviceFingerprint);
    if (!device) {
      device = await trustedDevicesRepo.registerDevice(user.id, deviceFingerprint, requestMeta);
      isNewDevice = true;
      await securityService.logNewDeviceLogin(user.id, device.id, requestMeta);
    }

    requestMeta.deviceId = device.id;

    const sessionRecord = await authRepo.createSession(user.id, requestMeta);
    const rft = await require('../repositories/refresh_tokens.repository').default.issueToken({
      userId: user.id,
      sessionId: sessionRecord.id,
      ...requestMeta
    });
    await authRepo.linkRefreshTokenToSession(sessionRecord.id, rft.record.id);

    const accessToken = generateAccessToken(user, sessionRecord.id, device.id);

    // Update device login
    await trustedDevicesRepo.updateDeviceLogin(device.id, true, sessionRecord.id, rft.record.id);

    // Login History - Success
    await loginHistoryRepo.recordLoginAttempt({
      ...requestMeta,
      userId: user.id,
      sessionId: sessionRecord.id,
      refreshTokenId: rft.record.id,
      deviceId: device.id,
      loginType: 'LOGIN',
      authenticationMethod: 'PASSWORD',
      loginStatus: 'SUCCESS',
      isSuccessful: true,
      isTrustedDevice: device.is_trusted,
      riskScore: isNewDevice ? 25 : 0
    });

    const secret = process.env.JWT_REFRESH_SECRET!;
    const refreshToken = jwt.sign(
      { userId: user.id, jti: rft.jwtId, raw: rft.rawToken },
      secret,
      { expiresIn: '30d' }
    );

    const userCamel = mapUserToCamelCase(user);

    return { user: userCamel, accessToken, refreshToken };
  } catch (error) {
    throw error;
  }
};

export const refreshTokens = async (refreshToken: string, requestMeta: any = {}) => {
  const secret = process.env.JWT_REFRESH_SECRET!;
  let decoded: any;
  try {
    decoded = jwt.verify(refreshToken, secret);
  } catch (err) {
    throw new AuthenticationError('Invalid or expired refresh token');
  }

  const { userId, jti, raw } = decoded;
  if (!userId || !jti || !raw) {
    throw new AuthenticationError('Malformed refresh token');
  }

  const rftRepo = require('../repositories/refresh_tokens.repository').default;
  const newTokenRecord = await rftRepo.rotateToken(userId, jti, raw, requestMeta);

  const user = await authRepo.getUserById(userId);
  if (!user) throw new NotFoundError('User not found');

  const accessToken = generateAccessToken(user, newTokenRecord.record.session_id, newTokenRecord.record.device_id);
  const newRefreshToken = jwt.sign(
    { userId: user.id, jti: newTokenRecord.jwtId, raw: newTokenRecord.rawToken },
    secret,
    { expiresIn: '30d' }
  );

  return { accessToken, refreshToken: newRefreshToken };
};

export const sendOTP = async (phone: string) => {
  const normalizedPhone = normalizeToE164(phone);
  const result = await twilioVerifyService.startVerification(normalizedPhone, 'sms');
  return {
    sid: result.sid,
    phone: normalizedPhone,
    maskedPhone: maskPhoneNumber(normalizedPhone),
    message: 'OTP sent successfully via SMS'
  };
};

export const verifyOTP = async (phone: string, otp: string, type: string = 'VERIFY', requestMeta: any = {}) => {
  const normalizedPhone = normalizeToE164(phone);
  const user = await authRepo.getUserByPhone(normalizedPhone);
  if (!user) throw new NotFoundError('User not found with this mobile number');

  // Validate OTP exclusively via Twilio Verify API v2
  const checkResult = await twilioVerifyService.checkVerification(normalizedPhone, otp);

  if (checkResult.status !== 'approved') {
    throw new BusinessRuleError('Invalid verification code. Please check and try again.');
  }

  // OTP successfully approved by Twilio: mark account as verified and ACTIVE
  const updatedUser = await authRepo.updateUser(user.id, {
    is_mobile_verified: true,
    is_phone_verified: true,
    is_email_verified: true,
    verified: true,
    status: 'ACTIVE'
  });

  // Fingerprinting & Device Registration
  const fingerprintRaw = `${requestMeta.browser || 'Unknown'}|${requestMeta.operatingSystem || 'Unknown'}|${requestMeta.platform || 'Unknown'}|${requestMeta.screenResolution || 'Unknown'}|${requestMeta.timezone || 'Unknown'}|${requestMeta.language || 'Unknown'}|${requestMeta.userAgent || 'Unknown'}|${requestMeta.deviceType || 'Unknown'}`;
  const deviceFingerprint = crypto.createHash('sha256').update(fingerprintRaw).digest('hex');

  let device = await trustedDevicesRepo.findDeviceByFingerprint(user.id, deviceFingerprint);
  if (!device) {
    device = await trustedDevicesRepo.registerDevice(user.id, deviceFingerprint, requestMeta);
  }

  requestMeta.deviceId = device.id;

  const sessionRecord = await authRepo.createSession(user.id, requestMeta);
  const rft = await require('../repositories/refresh_tokens.repository').default.issueToken({
    userId: user.id,
    sessionId: sessionRecord.id
  });
  await authRepo.linkRefreshTokenToSession(sessionRecord.id, rft.record.id);

  const accessToken = generateAccessToken(updatedUser || user, sessionRecord.id, device.id);

  // Update device activity/login
  await trustedDevicesRepo.updateDeviceLogin(device.id, true, sessionRecord.id, rft.record.id);

  const secret = process.env.JWT_REFRESH_SECRET!;
  const refreshToken = jwt.sign(
    { userId: user.id, jti: rft.jwtId, raw: rft.rawToken },
    secret,
    { expiresIn: '30d' }
  );

  const userCamel = mapUserToCamelCase(updatedUser || user);
  return { user: userCamel, accessToken, refreshToken };
};

export const resendOTP = async (phone: string) => {
  const normalizedPhone = normalizeToE164(phone);
  const user = await authRepo.getUserByPhone(normalizedPhone);
  if (!user) throw new NotFoundError('User not found with this mobile number');

  const result = await twilioVerifyService.startVerification(normalizedPhone, 'sms');

  return {
    sid: result.sid,
    phone: normalizedPhone,
    maskedPhone: maskPhoneNumber(normalizedPhone),
    message: 'OTP resent successfully via SMS'
  };
};

export const changePhone = async (oldPhone: string, newPhone: string) => {
  const normalizedOld = normalizeToE164(oldPhone);
  const normalizedNew = normalizeToE164(newPhone);

  const user = await authRepo.getUserByPhone(normalizedOld);
  if (!user) throw new NotFoundError('User not found');

  const existingPhoneUser = await authRepo.getUserByPhone(normalizedNew);
  if (existingPhoneUser && isUserVerified(existingPhoneUser)) {
    throw new BusinessRuleError('New mobile number is already registered to a verified account');
  }

  await authRepo.updateUser(user.id, { phone: normalizedNew, is_mobile_verified: false });

  // Trigger Twilio Verify OTP for the new phone
  await twilioVerifyService.startVerification(normalizedNew, 'sms');

  return { message: 'Mobile number updated. Verification OTP sent to new number.' };
};

export const forgotPassword = async (email: string) => {
  const cleanEmail = email.toLowerCase().trim();
  const user = await authRepo.getUserByEmail(cleanEmail);
  if (user) {
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}&userId=${user.id}`;
    try {
      await sendEmail({
        to: user.email,
        subject: 'Reset your AgriAssist password',
        html: `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`
      });
    } catch (err) {
      logger.warn('Failed to send reset email:', err);
    }
  }
  return { message: 'If an account exists with this email, a reset link has been sent.' };
};

export const resetPassword = async (userId: string, token: string, newPassword: string) => {
  const user = await authRepo.getUserById(userId);
  if (!user) throw new NotFoundError('User not found');
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await authRepo.updateUser(userId, { password_hash: hashedPassword });
  return { message: 'Password reset successfully. Please log in.' };
};

export const logoutUser = async (userId: string, refreshToken: string) => {
  let decoded: any;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!);
  } catch {
    return;
  }
  const { jti } = decoded;
  if (!jti) return;

  await require('../repositories/refresh_tokens.repository').default.revokeToken(jti, 'USER_LOGOUT');
  const { data: rftRecord } = await supabase.from('refresh_tokens').select('session_id').eq('jwt_id', jti).maybeSingle();
  if (rftRecord?.session_id) {
    await authRepo.terminateSession(rftRecord.session_id, userId, 'USER_LOGOUT');
    await loginHistoryRepo.updateLogoutTime(rftRecord.session_id);
  }
};

export const logoutAllDevices = async (userId: string) => {
  const { data: sessions } = await supabase.from('sessions').select('id').eq('user_id', userId).eq('session_status', 'ACTIVE');
  if (sessions) {
    for (const session of sessions) {
      await loginHistoryRepo.updateLogoutTime(session.id);
    }
  }
  await authRepo.terminateAllSessions(userId);
  await require('../repositories/refresh_tokens.repository').default.revokeAllUserTokens(userId, 'USER_LOGOUT');
};

export const getMe = async (userId: string) => {
  const user = await authRepo.getUserById(userId);
  if (!user) throw new NotFoundError('User not found');
  return mapUserToCamelCase(user);
};

export const updateProfile = async (userId: string, data: any) => {
  const user = await authRepo.getUserById(userId);
  if (!user) throw new NotFoundError('User not found');

  const updatePayload: any = {};
  if (data.fullName) updatePayload.full_name = data.fullName;
  if (data.name) updatePayload.name = data.name;
  if (data.bio) updatePayload.bio = data.bio;
  if (data.address) updatePayload.address = data.address;
  if (data.state) updatePayload.state = data.state;
  if (data.district) updatePayload.district = data.district;
  if (data.pincode) updatePayload.pincode = data.pincode;
  if (data.preferredLanguage) updatePayload.preferred_language = data.preferredLanguage;
  if (data.profileCompleted !== undefined) updatePayload.profile_completed = data.profileCompleted;
  if (data.onboardingCompleted !== undefined) updatePayload.onboarding_completed = data.onboardingCompleted;

  const updated = await authRepo.updateUser(userId, updatePayload);
  return mapUserToCamelCase(updated || user);
};

export const changePassword = async (userId: string, currentPass: string, newPass: string) => {
  const user = await authRepo.getUserById(userId);
  if (!user) throw new NotFoundError('User not found');

  const isValid = await bcrypt.compare(currentPass, user.password_hash || '');
  if (!isValid) throw new BusinessRuleError('Current password is incorrect');

  const newHash = await bcrypt.hash(newPass, 10);
  await authRepo.updateUser(userId, { password_hash: newHash });
  return { message: 'Password changed successfully' };
};

export const getActiveSessions = async (userId: string) => {
  const sessions = await authRepo.getActiveSessions(userId);
  return sessions;
};

export const getSessionById = async (sessionId: string, userId: string) => {
  const session = await authRepo.getSessionById(sessionId, userId);
  if (!session) throw new NotFoundError('Session not found');
  return session;
};

export const terminateSession = async (sessionId: string, userId: string) => {
  await authRepo.terminateSession(sessionId, userId, 'ADMIN_REVOKED');
  await loginHistoryRepo.updateLogoutTime(sessionId);
};

export const listLoginHistory = async (userId: string) => {
  return await loginHistoryRepo.getUserLoginHistory(userId);
};

export const getLoginDetails = async (userId: string, historyId: string) => {
  const history = await loginHistoryRepo.getLoginDetails(userId, historyId);
  if (!history) throw new NotFoundError('Login history not found');
  return history;
};

export const listDevices = async (userId: string) => {
  return await trustedDevicesRepo.listDevices(userId);
};

export const getDeviceById = async (userId: string, deviceId: string) => {
  const device = await trustedDevicesRepo.getDeviceById(userId, deviceId);
  if (!device) throw new NotFoundError('Device not found');
  return device;
};

export const renameDevice = async (userId: string, deviceId: string, name: string) => {
  return await trustedDevicesRepo.renameDevice(userId, deviceId, name);
};

export const removeDevice = async (userId: string, deviceId: string) => {
  return await trustedDevicesRepo.removeDevice(userId, deviceId);
};

export const blockDevice = async (deviceId: string, reason: string) => {
  return await trustedDevicesRepo.setDeviceStatus(deviceId, 'BLOCKED', reason);
};

export const unblockDevice = async (deviceId: string) => {
  return await trustedDevicesRepo.setDeviceStatus(deviceId, 'TRUSTED');
};

export const sessionHeartbeat = async (refreshToken: string, userId: string) => {
  let decoded: any;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!);
  } catch {
    return;
  }
  const { jti } = decoded;
  if (!jti) return;
  const { data: rftRecord } = await supabase.from('refresh_tokens').select('session_id').eq('jwt_id', jti).maybeSingle();
  if (rftRecord?.session_id) {
    await authRepo.updateSessionActivity(rftRecord.session_id);
  }
};

export default {
  registerUser,
  loginUser,
  refreshTokens,
  sendOTP,
  verifyOTP,
  resendOTP,
  changePhone,
  forgotPassword,
  resetPassword,
  logoutUser,
  logoutAllDevices,
  getMe,
  checkUserAvailability,
  saveRegistrationDraft,
  getActiveSessions,
  getSessionById,
  terminateSession,
  listLoginHistory,
  getLoginDetails,
  listDevices,
  getDeviceById,
  renameDevice,
  removeDevice,
  blockDevice,
  unblockDevice,
  sessionHeartbeat,
  mapUserToCamelCase,
  isUserVerified,
};
