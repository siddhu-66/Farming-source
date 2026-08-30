'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { motion } from 'framer-motion';
import Link from 'next/link';
import api from '@/lib/api';
import { AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

const schema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof schema>;

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const userId = searchParams.get('userId') || '';

  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    if (!token || !userId) {
      setErrorMessage('Invalid or expired password reset link. Please request a new one.');
      return;
    }

    setErrorMessage('');
    try {
      await api.post('/auth/password/reset', {
        userId,
        token,
        newPassword: data.password,
      });
      setIsSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2500);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Failed to reset password. The link may have expired.');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md mx-auto">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Create New Password</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Please enter your new password below.
        </p>
      </div>

      {isSuccess ? (
        <div className="mt-8 bg-green-500/10 border border-green-500/20 rounded-2xl p-6 text-center space-y-4">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Password Reset Successfully!</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Your password has been updated. Redirecting you to the login page...
          </p>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center text-sm font-semibold text-green-600 hover:text-green-500 dark:text-green-400 gap-1"
            >
              <ArrowLeft className="w-4 h-4" /> Go to Login Now
            </Link>
          </div>
        </div>
      ) : (
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {(!token || !userId) && (
            <div className="flex items-center gap-2 p-3 text-sm text-amber-600 bg-amber-500/10 border border-amber-500/20 rounded-xl dark:text-amber-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Missing reset token or user ID. Please check the link from your email.</span>
            </div>
          )}

          {errorMessage && (
            <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-500/10 border border-red-500/20 rounded-xl dark:text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <Input
            label="New Password"
            type="password"
            placeholder="••••••••"
            {...register('password')}
            error={errors.password?.message}
          />
          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            {...register('confirmPassword')}
            error={errors.confirmPassword?.message}
          />
          <Button
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            isLoading={isSubmitting}
            disabled={!token || !userId}
          >
            Reset Password
          </Button>

          <p className="text-center text-sm text-gray-500">
            Remembered your password?{' '}
            <Link href="/login" className="font-medium text-green-600 hover:underline dark:text-green-400">
              Back to login
            </Link>
          </p>
        </form>
      )}
    </motion.div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[300px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
