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
import { sendSMS } from './sms';
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

export const checkUserAvailability = async (email: string, phone: string) => {
  let emailAvailable = true;
  let phoneAvailable = true;
  
  if (email) {
    const userEmail = await authRepo.getUserByEmail(email);
    if (userEmail) emailAvailable = false;
  }
  
  if (phone) {
    const userMobile = await authRepo.getUserByPhone(phone);
    if (userMobile) phoneAvailable = false;
  }
  
  return { emailAvailable, phoneAvailable };
};

export const saveRegistrationDraft = async (draftData: any) => {
  // Mock saving to a database since there's no defined schema for this yet.
  // In a real implementation, this would save to a `registration_drafts` table keyed by an ephemeral session ID or email.
  logger.info(`Saved registration draft for role: ${draftData.role}`);
  return true;
};

const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const registerUser = async (data: any, requestMeta: any = {}) => {
  const pInfo = data.personalInfo || {};
  const acc = data.account || {};
  const prof = data.profile || {};
  
  // [DEV ONLY] Disabling uniqueness checks for development
  // UNCOMMENT FOR PRODUCTION
  /*
  if (pInfo.email) {
    const existingEmail = await authRepo.getUserByEmail(pInfo.email);
    if (existingEmail) throw new BusinessRuleError('Email already registered');
  }

  const existingPhone = await authRepo.getUserByPhone(pInfo.phone);
  if (existingPhone) throw new BusinessRuleError('Phone number already registered');
  */

  const hashedPassword = await bcrypt.hash(acc.password, 10);
  const fullName = `${pInfo.firstName} ${pInfo.lastName}`.trim();

  const insertData = {
    full_name: fullName,


    email: pInfo.email ? pInfo.email.toLowerCase() : null,
    phone: pInfo.phone,
    password_hash: hashedPassword,
    role: data.role.toUpperCase(),
    preferred_language: prof.language || 'English',
    timezone: 'Asia/Kolkata', // default
  };
  
  const user = await authRepo.createUser(insertData);
  await authRepo.createRoleProfile(data.role, user.id);

  if (user.email) {
    // Send email verification
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    // Note: Assuming a generic token table exists, or we append to user table if needed.
    // We'll skip saving the token to DB in this POC if the schema doesn't have it explicitly,
    // or we can add it to a tokens table.
    
    const verificationUrl = `${process.env.CLIENT_URL}/auth/verify-email?token=${verificationToken}&id=${user.id}`;
    try {
      await sendEmail({
        to: user.email,
        subject: 'Welcome to AgriAssist — Verify Your Email',
        html: getWelcomeEmailTemplate(user.full_name, verificationUrl),
      });
    } catch (err) {
      logger.warn('Failed to send verification email:', err);
    }
  }

  // Send OTP for phone verification
  try {
    const otp = generateOTP();
    await authRepo.insertOtp({
      user_id: user.id,
      phone: user.phone,
      otp_hash: otp,
      purpose: 'phone_verification',
      channel: 'SMS',
      status: 'PENDING',
      expires_at: new Date(Date.now() + 10 * 60000).toISOString()
    });
    await sendSMS(user.phone, `Your AgriAssist OTP is: ${otp}. Valid for 10 minutes.`);
  } catch (err) {
    logger.warn('Failed to send OTP SMS:', err);
  }

  // Fingerprinting & Device Registration
  const fingerprintRaw = `${requestMeta.browser || 'Unknown'}|${requestMeta.operatingSystem || 'Unknown'}|${requestMeta.platform || 'Unknown'}|${requestMeta.screenResolution || 'Unknown'}|${requestMeta.timezone || 'Unknown'}|${requestMeta.language || 'Unknown'}|${requestMeta.userAgent || 'Unknown'}|${requestMeta.deviceType || 'Unknown'}`;
  const deviceFingerprint = crypto.createHash('sha256').update(fingerprintRaw).digest('hex');

  let isNewDevice = false;
  let device = await trustedDevicesRepo.findDeviceByFingerprint(user.id, deviceFingerprint);
  if (!device) {
    device = await trustedDevicesRepo.registerDevice(user.id, deviceFingerprint, requestMeta);
    isNewDevice = true;
    
    // Log Security Event: New Device Login
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
  
  // We embed the rawToken in a JWT so it has a jti and can be decoded
  const secret = process.env.JWT_REFRESH_SECRET!;
  const refreshToken = jwt.sign(
    { userId: user.id, jti: rft.jwtId, raw: rft.rawToken },
    secret,
    { expiresIn: '30d' }
  );
  
  const userCamel = mapUserToCamelCase(user);

  return { user: userCamel, accessToken, refreshToken };
};

export const loginUser = async (data: any, requestMeta: any = {}) => {
  let user;
  try {
    if (data.email) {
      user = await authRepo.getUserByEmail(data.email);
    } else if (data.phone) {
      user = await authRepo.getUserByPhone(data.phone);
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
      await authRepo.updateUser(user.id, { 
         
      });
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
      throw new AuthenticationError('Account is not active');
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
      
      // Log Security Event: New Device Login
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

export const sendOTP = async (userId: string, phone: string) => {
  const otp = generateOTP();
  await authRepo.insertOtp({ 
    user_id: userId, 
    phone: phone, 
    otp_hash: otp, 
    purpose: 'login',
    channel: 'SMS',
    status: 'PENDING',
    expires_at: new Date(Date.now() + 10 * 60000).toISOString()
  });
  await sendSMS(phone, `Your AgriAssist login OTP: ${otp}. Valid for 10 minutes. Do not share.`);

  return { message: 'OTP sent successfully' };
};

export const verifyOTP = async (mobile: string, otp: string, type: string, requestMeta: any = {}) => {
  const user = await authRepo.getUserByPhone(mobile);
  if (!user) throw new NotFoundError('User not found');

  const otpRecord = await authRepo.getValidOtp(user.id);

  if (!otpRecord) throw new BusinessRuleError('OTP expired or not found. Request a new one.');

  if (otpRecord.otp_hash !== otp) {
    throw new BusinessRuleError('Invalid OTP');
  }

  await authRepo.markOtpUsed(otpRecord.id);
  await authRepo.updateUser(user.id, { is_mobile_verified: true, status: 'ACTIVE' });

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

  const accessToken = generateAccessToken(user, sessionRecord.id, device.id);

  // Update device activity/login
  await trustedDevicesRepo.updateDeviceLogin(device.id, true, sessionRecord.id, rft.record.id);

  const secret = process.env.JWT_REFRESH_SECRET!;
  const refreshToken = jwt.sign(
    { userId: user.id, jti: rft.jwtId, raw: rft.rawToken },
    secret,
    { expiresIn: '30d' }
  );

  const userCamel = mapUserToCamelCase(user);
  return { user: userCamel, accessToken, refreshToken };
};

export const resendOTP = async (mobile: string) => {
  const user = await authRepo.getUserByPhone(mobile);
  if (!user) throw new NotFoundError('User not found');

  const otp = generateOTP();
  await authRepo.insertOtp({
    user_id: user.id,
    phone: user.phone,
    otp_hash: otp,
    purpose: 'phone_verification',
    channel: 'SMS',
    status: 'PENDING',
    expires_at: new Date(Date.now() + 10 * 60000).toISOString()
  });
  
  await sendSMS(user.phone, `Your AgriAssist OTP is: ${otp}. Valid for 10 minutes.`);
  return { message: 'OTP resent successfully' };
};

export const changePhone = async (oldPhone: string, newPhone: string) => {
  const user = await authRepo.getUserByPhone(oldPhone);
  if (!user) throw new NotFoundError('User not found');

  const existingPhone = await authRepo.getUserByPhone(newPhone);
  if (existingPhone) throw new BusinessRuleError('New phone number already registered');

  await authRepo.updateUser(user.id, { phone: newPhone, is_mobile_verified: false });

  return { message: 'Mobile number updated successfully' };
};

export const forgotPassword = async (email: string) => {
  // Implement logic
  return { message: 'If an account exists with this email, a reset link has been sent.' };
};

export const resetPassword = async (userId: string, token: string, newPassword: string) => {
  // Implement logic
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

export const sessionHeartbeat = async (refreshToken: string, userId: string) => {
  if (!refreshToken) return;
  const secret = process.env.JWT_REFRESH_SECRET!;
  try {
    const decoded: any = jwt.verify(refreshToken, secret);
    if (decoded && decoded.jti) {
      const rftRecord = await supabase.from('refresh_tokens').select('session_id').eq('jwt_id', decoded.jti).single();
      if (rftRecord.data?.session_id) {
        await authRepo.updateSessionActivity(rftRecord.data.session_id);
        
        // Also update device activity
        const sessionRecord = await authRepo.getSessionById(rftRecord.data.session_id, userId);
        if (sessionRecord?.device_id) {
          await trustedDevicesRepo.updateDeviceActivity(sessionRecord.device_id);
        }
      }
    }
  } catch (err) {
    logger.warn('Failed to update session heartbeat', err);
  }
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
  if (!name) throw new BusinessRuleError('Device name is required');
  await trustedDevicesRepo.renameDevice(userId, deviceId, name);
};

export const removeDevice = async (userId: string, deviceId: string) => {
  await trustedDevicesRepo.removeDevice(userId, deviceId);
};

export const blockDevice = async (deviceId: string, reason: string) => {
  await trustedDevicesRepo.setDeviceStatus(deviceId, 'BLOCKED', reason);
};

export const unblockDevice = async (deviceId: string) => {
  await trustedDevicesRepo.setDeviceStatus(deviceId, 'TRUSTED');
};

export const updateProfile = async (userId: string, data: any) => {
  const updates: Record<string, unknown> = {};
  const allowedFields = ['firstName', 'lastName', 'profilePhoto', 'preferredLanguage', 'timezone'];
    if (data.firstName || data.lastName) {
      const user = await authRepo.getUserById(userId);
      const existingNames = (user.full_name || '').split(' ');
      const first = data.firstName || existingNames[0] || '';
      const last = data.lastName || existingNames.slice(1).join(' ') || '';
      updates['full_name'] = `${first} ${last}`.trim();
    }
  
  if (data.profilePhoto) updates['profile_photo'] = data.profilePhoto;
  if (data.preferredLanguage) updates['preferred_language'] = data.preferredLanguage;
  if (data.timezone) updates['timezone'] = data.timezone;

  const user = await authRepo.updateUser(userId, updates);
  return mapUserToCamelCase(user);
};

export const changePassword = async (userId: string, currentPass: string, newPass: string) => {
  const user = await authRepo.getUserById(userId);
  if (!user) throw new NotFoundError('User not found');

  const isMatch = await bcrypt.compare(currentPass, user.password_hash);
  if (!isMatch) throw new BusinessRuleError('Current password is incorrect');

  const hashedPassword = await bcrypt.hash(newPass, 10);
  await authRepo.updateUser(userId, { 
    password_hash: hashedPassword,
    last_password_changed_at: new Date().toISOString()
  });

  return { message: 'Password changed successfully' };
};

// Email Templates
const getWelcomeEmailTemplate = (name: string, verificationUrl: string): string => `
<!DOCTYPE html>
<html>
<body style="font-family: Inter, sans-serif; background: #f5f5f5; padding: 40px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px;">
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="background: linear-gradient(135deg, #16a34a, #15803d); width: 64px; height: 64px; border-radius: 16px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 32px;">🌾</span>
      </div>
      <h1 style="color: #16a34a; margin: 0;">Welcome to AgriAssist!</h1>
    </div>
    <p style="color: #374151; font-size: 16px;">Hi ${name},</p>
    <p style="color: #374151;">Thank you for joining AgriAssist — India's premier agricultural digital ecosystem.</p>
    <p style="color: #374151;">Please verify your email address to get started:</p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${verificationUrl}" style="background: linear-gradient(135deg, #16a34a, #15803d); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Verify Email Address</a>
    </div>
    <p style="color: #6b7280; font-size: 14px;">This link expires in 24 hours. If you didn't create an account, please ignore this email.</p>
    <hr style="border: 1px solid #e5e7eb; margin: 32px 0;">
    <p style="color: #9ca3af; font-size: 12px; text-align: center;">© 2026 AgriAssist. All rights reserved.</p>
  </div>
</body>
</html>`;
