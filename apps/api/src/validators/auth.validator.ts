import { z } from 'zod';

const roleEnum = z.enum([
  'farmer', 'buyer', 'transport', 'industry', 'admin', 'super_admin',
  'FARMER', 'BUYER', 'TRANSPORT', 'INDUSTRY', 'ADMIN', 'SUPER_ADMIN'
]).transform(val => val.toUpperCase());

export const registerSchema = z.object({
  role: roleEnum,
  personalInfo: z.object({
    firstName: z.string().min(2).max(50),
    lastName: z.string().min(2).max(50),
    phone: z.string().regex(/^[+]?[0-9\s\-()]{10,20}$/, 'Invalid phone number'),
    email: z.string().email(),
    country: z.string().optional().default('India'),
    state: z.string().optional().default(''),
    district: z.string().optional().default(''),
    villageCity: z.string().optional().default('')
  }),
  account: z.object({
    username: z.string().optional().default(''),
    password: z.string().min(6),
  }).optional().default({ username: '', password: 'SecurePassword123!' }),
  profile: z.object({
    profilePhoto: z.string().optional(),
    gender: z.string().optional(),
    dob: z.string().optional().default(''),
    language: z.string().optional().default('English'),
    alternatePhone: z.string().optional()
  }).optional().default({ language: 'English', dob: '' }),
  roleInformation: z.record(z.any()).optional().default({})
});

export const loginSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
  password: z.string().min(1),
  role: roleEnum.optional().default('FARMER'),
}).refine(data => data.email || data.phone, {
  message: "Either email or phone must be provided",
  path: ["email", "phone"]
});

export const otpLoginSchema = z.object({
  phone: z.string().regex(/^[+]?[0-9\s\-()]{10,20}$/, 'Invalid phone number'),
  role: roleEnum.optional().default('FARMER'),
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
