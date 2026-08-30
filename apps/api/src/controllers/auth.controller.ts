import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { formatSuccess } from '../utils/formatResponse';
import { 
  registerSchema, 
  loginSchema, 
  otpLoginSchema, 
  verifyOtpSchema, 
  forgotPasswordSchema, 
  resetPasswordSchema,
  updateProfileSchema,
  changePasswordSchema,
  resendOtpSchema,
  changePhoneSchema
} from '../validators/auth.validator';
import { ValidationError } from '../utils/errors';

export const checkUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, phone } = req.body;
    const result = await authService.checkUserAvailability(email, phone);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const saveDraft = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const draft = req.body;
    // Implementation to save draft (e.g. to a registration_drafts table)
    await authService.saveRegistrationDraft(draft);
    res.json(formatSuccess('Draft saved successfully'));
  } catch (error) {
    next(error);
  }
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const requestMeta = {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    };
    const result = await authService.registerUser(validatedData, requestMeta);
    res.status(201).json(formatSuccess('Registration successful', result));
  } catch (error: any) {
    if (error.name === 'ZodError') {
      next(new ValidationError('Invalid input data', error.errors));
    } else {
      next(error);
    }
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const requestMeta = {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    };
    const result = await authService.loginUser(validatedData, requestMeta);

    // Set HTTP cookie for Next.js middleware
    if (result.accessToken) {
      res.cookie('token', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        path: '/'
      });
    }

    res.json(formatSuccess('Login successful', result));
  } catch (error: any) {
    if (error.name === 'ZodError') {
      next(new ValidationError('Invalid input data', error.errors));
    } else {
      next(error);
    }
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw new ValidationError('Refresh token required');
    const requestMeta = {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    };
    const result = await authService.refreshTokens(refreshToken, requestMeta);

    // Update HTTP cookie with new access token
    if (result.accessToken) {
      res.cookie('token', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000,
        path: '/'
      });
    }

    res.json(formatSuccess('Token refreshed', result));
  } catch (error) {
    next(error);
  }
};

export const sendOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone } = resendOtpSchema.parse(req.body);
    const result = await authService.sendOTP(phone);
    res.json(formatSuccess('OTP sent successfully', result));
  } catch (error: any) {
    if (error.name === 'ZodError') {
      next(new ValidationError('Invalid input data', error.errors));
    } else {
      next(error);
    }
  }
};

export const requestOtp = async (req: Request, res: Response, next: NextFunction) => {
  return sendOtp(req, res, next);
};

export const verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone, otp } = verifyOtpSchema.parse(req.body);
    const requestMeta = {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    };
    const result = await authService.verifyOTP(phone, otp, 'VERIFY', requestMeta);

    // Set HTTP cookie if tokens are returned (OTP login)
    if (result.accessToken) {
      res.cookie('token', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000,
        path: '/'
      });
    }

    res.json(formatSuccess('OTP Verified', result));
  } catch (error: any) {
    if (error.name === 'ZodError') {
      next(new ValidationError('Invalid input data', error.errors));
    } else {
      next(error);
    }
  }
};

export const resendOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone } = resendOtpSchema.parse(req.body);
    await authService.resendOTP(phone);
    res.json(formatSuccess('OTP resent successfully'));
  } catch (error: any) {
    if (error.name === 'ZodError') {
      next(new ValidationError('Invalid input data', error.errors));
    } else {
      next(error);
    }
  }
};

export const changePhone = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { oldPhone, newPhone } = changePhoneSchema.parse(req.body);
    await authService.changePhone(oldPhone, newPhone);
    res.json(formatSuccess('phone number updated successfully'));
  } catch (error: any) {
    if (error.name === 'ZodError') {
      next(new ValidationError('Invalid input data', error.errors));
    } else {
      next(error);
    }
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const { refreshToken } = req.body;
    if (userId && refreshToken) {
      await authService.logoutUser(userId, refreshToken);
    }

    // Clear HTTP cookie
    res.clearCookie('token', { path: '/' });

    res.json(formatSuccess('Logged out successfully'));
  } catch (error) {
    next(error);
  }
};

export const logoutAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    if (userId) {
      await authService.logoutAllDevices(userId);
    }
    res.json(formatSuccess('Logged out from all devices successfully'));
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);
    const result = await authService.forgotPassword(email);
    res.json(formatSuccess(result.message));
  } catch (error: any) {
    if (error.name === 'ZodError') {
      next(new ValidationError('Invalid input data', error.errors));
    } else {
      next(error);
    }
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, token, newPassword } = resetPasswordSchema.parse(req.body);
    const result = await authService.resetPassword(userId, token, newPassword);
    res.json(formatSuccess(result.message));
  } catch (error: any) {
    if (error.name === 'ZodError') {
      next(new ValidationError('Invalid input data', error.errors));
    } else {
      next(error);
    }
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const user = await authService.getMe(userId);
    res.json(formatSuccess('Profile fetched successfully', { user }));
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const validatedData = updateProfileSchema.parse(req.body);
    const user = await authService.updateProfile(userId, validatedData);
    res.json(formatSuccess('Profile updated successfully', { user }));
  } catch (error: any) {
    if (error.name === 'ZodError') {
      next(new ValidationError('Invalid input data', error.errors));
    } else {
      next(error);
    }
  }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
    const result = await authService.changePassword(userId, currentPassword, newPassword);
    res.json(formatSuccess(result.message));
  } catch (error: any) {
    if (error.name === 'ZodError') {
      next(new ValidationError('Invalid input data', error.errors));
    } else {
      next(error);
    }
  }
};
export const getActiveSessions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const sessions = await authService.getActiveSessions(userId);
    res.json(formatSuccess('Active sessions retrieved', { sessions }));
  } catch (error) {
    next(error);
  }
};

export const getSessionById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const session = await authService.getSessionById(req.params.id as string, userId);
    res.json(formatSuccess('Session retrieved', { session }));
  } catch (error) {
    next(error);
  }
};

export const terminateSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    await authService.terminateSession(req.params.id as string, userId);
    res.json(formatSuccess('Session terminated successfully'));
  } catch (error) {
    next(error);
  }
};

export const sessionHeartbeat = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const { refreshToken } = req.body;
    if (refreshToken) {
      await authService.sessionHeartbeat(refreshToken, userId);
    }
    res.json(formatSuccess('Session kept alive'));
  } catch (error) {
    next(error);
  }
};

// --- LOGIN HISTORY ---

export const getLoginHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const history = await authService.listLoginHistory(userId);
    res.json(formatSuccess('Login history retrieved', { history }));
  } catch (error) {
    next(error);
  }
};

export const getLoginHistoryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const history = await authService.getLoginDetails(userId, req.params.id as string);
    res.json(formatSuccess('Login detail retrieved', { history }));
  } catch (error) {
    next(error);
  }
};

// --- DEVICE MANAGEMENT ---

export const listDevices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const devices = await authService.listDevices(userId);
    res.json(formatSuccess('Devices retrieved', { devices }));
  } catch (error) {
    next(error);
  }
};

export const getDeviceById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const device = await authService.getDeviceById(userId, req.params.id as string);
    res.json(formatSuccess('Device retrieved', { device }));
  } catch (error) {
    next(error);
  }
};

export const renameDevice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const { name } = req.body;
    await authService.renameDevice(userId, req.params.id as string, name);
    res.json(formatSuccess('Device renamed successfully'));
  } catch (error) {
    next(error);
  }
};

export const removeDevice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    await authService.removeDevice(userId, req.params.id as string);
    res.json(formatSuccess('Device removed successfully'));
  } catch (error) {
    next(error);
  }
};

// Admin endpoints could be here or in admin controller
export const blockDevice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reason } = req.body;
    await authService.blockDevice(req.params.id as string, reason || 'ADMIN_BLOCKED');
    res.json(formatSuccess('Device blocked successfully'));
  } catch (error) {
    next(error);
  }
};

export const unblockDevice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await authService.unblockDevice(req.params.id as string);
    res.json(formatSuccess('Device unblocked successfully'));
  } catch (error) {
    next(error);
  }
};

export const checkEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    const result = await authService.checkUserAvailability(email, undefined);
    res.json(formatSuccess(result.emailMessage || 'Email availability checked', {
      available: result.emailAvailable,
      message: result.emailMessage
    }));
  } catch (error) {
    next(error);
  }
};

export const checkPhone = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone } = req.body;
    const result = await authService.checkUserAvailability(undefined, phone);
    res.json(formatSuccess(result.phoneMessage || 'Phone availability checked', {
      available: result.phoneAvailable,
      message: result.phoneMessage
    }));
  } catch (error) {
    next(error);
  }
};



export const verifyPasswordResetOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone, otp } = verifyOtpSchema.parse(req.body);
    const requestMeta = {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    };
    const result = await authService.verifyOTP(phone, otp, 'PASSWORD_RESET', requestMeta);
    res.json(formatSuccess('OTP verified for password reset', result));
  } catch (error: any) {
    if (error.name === 'ZodError') {
      next(new ValidationError('Invalid input data', error.errors));
    } else {
      next(error);
    }
  }
};

export const uploadAvatar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const file = req.file;
    if (!file) throw new Error('No file provided');
    // Upload logic here
    res.json(formatSuccess('Avatar uploaded successfully'));
  } catch (error) {
    next(error);
  }
};

export const exportLoginHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    // Export logic here
    res.json(formatSuccess('Login history exported'));
  } catch (error) {
    next(error);
  }
};

export const trustDevice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const deviceId = req.params.id;
    // Trust device logic here
    res.json(formatSuccess('Device trusted successfully'));
  } catch (error) {
    next(error);
  }
};
