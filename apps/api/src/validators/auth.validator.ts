import { z } from 'zod';

export const registerSchema = z.object({
  role: z.enum(['farmer', 'buyer', 'transport', 'industry', 'admin', 'super_admin']),
  personalInfo: z.object({
    firstName: z.string().min(2).max(50),
    lastName: z.string().min(2).max(50),
    phone: z.string().regex(/^[+]?[0-9\s\-()]{10,20}$/, 'Invalid phone number'),
    email: z.string().email(),
    country: z.string().min(2),
    state: z.string().min(2),
    district: z.string().min(2),
    villageCity: z.string().min(2)
  }),
  account: z.object({
    username: z.string().min(5),
    password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/, 'Password must contain uppercase, lowercase, number and special character'),
  }),
  profile: z.object({
    profilePhoto: z.string().optional(),
    gender: z.string().optional(),
    dob: z.string(),
    language: z.string(),
    alternatePhone: z.string().optional()
  }),
  roleInformation: z.record(z.any())
});

export const loginSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
  password: z.string().min(1),
  role: z.enum(['FARMER', 'BUYER', 'TRANSPORT', 'INDUSTRY', 'ADMIN', 'SUPER_ADMIN']),
}).refine(data => data.email || data.phone, {
  message: "Either email or phone must be provided",
  path: ["email", "phone"]
});

export const otpLoginSchema = z.object({
  phone: z.string().regex(/^[+]?[0-9\s\-()]{10,20}$/, 'Invalid phone number'),
  role: z.enum(['FARMER', 'BUYER', 'TRANSPORT', 'INDUSTRY', 'ADMIN', 'SUPER_ADMIN']),
});

export const verifyOtpSchema = z.object({
  phone: z.string(),
  otp: z.string().length(6),
});

export const resendOtpSchema = z.object({
  phone: z.string()
});

export const changePhoneSchema = z.object({
  oldPhone: z.string(),
  newPhone: z.string()
});

export const forgotPasswordSchema = z.object({ 
  email: z.string().email() 
});

export const resetPasswordSchema = z.object({
  userId: z.string(),
  token: z.string(),
  newPassword: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
});

export const updateProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  profilePhoto: z.string().optional(),
  preferredLanguage: z.string().optional(),
  timezone: z.string().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
});
