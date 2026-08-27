'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('farmer');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password, role: role.toUpperCase() });
      if (res.data.success) {
        setAuth(res.data.data.user, res.data.data.accessToken, res.data.data.refreshToken);
        toast.success('Login successful');
        router.push(`/${role}/dashboard`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-xl dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
        <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Sign in to your account</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Or <Link href="/register" className="font-medium text-primary hover:text-primary/80">create a new account</Link>
        </p>
      </div>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <Select 
            label="I am a..." 
            value={role}
            onChange={(e) => setRole(e.target.value)}
            options={[
              { value: 'farmer', label: 'Farmer' },
              { value: 'buyer', label: 'Buyer/Wholesaler' },
              { value: 'transport', label: 'Transport Provider' },
              { value: 'industry', label: 'Industrial Buyer' },
              { value: 'admin', label: 'Admin' }
            ]} 
            required 
          />
          <Input 
            label="Email address" 
            type="email" 
            required 
            placeholder="you@example.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input 
            label="Password" 
            type="password" 
            required 
            placeholder="••••••••" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button className="w-full" type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
      </div>
    </div>
  );
}
