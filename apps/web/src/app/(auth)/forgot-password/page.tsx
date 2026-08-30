'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    setErrorMessage('');
    try {
      const response = await api.post('/auth/password/forgot', {
        email: data.email,
      });
      setIsSuccess(true);
      setSuccessMessage(response.data?.message || 'If an account exists with this email, a reset link has been sent.');
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Failed to send password reset link. Please try again.');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md mx-auto">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Reset Password</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Enter your registered email and we will send you a password reset link.
        </p>
      </div>

      {isSuccess ? (
        <div className="mt-8 bg-green-500/10 border border-green-500/20 rounded-2xl p-6 text-center space-y-4">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Check Your Inbox</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {successMessage}
          </p>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center text-sm font-semibold text-green-600 hover:text-green-500 dark:text-green-400 gap-1"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </div>
        </div>
      ) : (
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-500/10 border border-red-500/20 rounded-xl dark:text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <Input
            label="Email address"
            type="email"
            placeholder="you@example.com"
            {...register('email')}
            error={errors.email?.message}
          />

          <Button className="w-full bg-green-600 hover:bg-green-700 text-white" isLoading={isSubmitting}>
            Send Reset Link
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
