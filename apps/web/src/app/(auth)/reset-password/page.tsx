'use client';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { motion } from 'framer-motion';

const schema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof schema>;

export default function ResetPasswordPage() {
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
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Create New Password</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Please enter your new password below.
        </p>
      </div>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
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
        <Button className="w-full" isLoading={isSubmitting}>Reset Password</Button>
      </form>
    </motion.div>
  );
}
