'use client';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import { motion } from 'framer-motion';

const schema = z.object({
  email: z.string().email('Invalid email address'),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    // Mock API
    await new Promise(res => setTimeout(res, 1000));
    console.log(data);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Reset Password</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Enter your email and we'll send you a link to reset your password.
        </p>
      </div>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <Input 
          label="Email address" 
          type="email" 
          placeholder="you@example.com" 
          {...register('email')}
          error={errors.email?.message}
        />
        <Button className="w-full" isLoading={isSubmitting}>Send Reset Link</Button>
        <p className="text-center text-sm text-gray-500">
          Remembered your password? <Link href="/login" className="font-medium text-primary hover:underline">Back to login</Link>
        </p>
      </form>
    </motion.div>
  );
}
