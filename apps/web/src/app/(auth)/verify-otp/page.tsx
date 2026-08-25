'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { OTPInput } from '@/components/auth/OTPInput';
import { useRegistrationStore } from '@/stores/registrationStore';
import api from '@/lib/api';
import { ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

export default function VerifyOTPPage() {
  const router = useRouter();
  const { data: regData } = useRegistrationStore();
  const { setAuth } = useAuthStore();
  const [mobile, setMobile] = useState('');
  
  const [timeLeft, setTimeLeft] = useState(60);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // If no mobile number is found in the registration store, redirect back
    if (!regData.personalInfo.phone) {
      router.replace('/register/role-selection');
    } else {
      setMobile(regData.personalInfo.phone);
    }
  }, [regData, router]);

  useEffect(() => {
    if (timeLeft > 0 && !isSuccess) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, isSuccess]);

  const handleVerify = async (otpValue: string) => {
    if (otpValue.length !== 6) return;
    
    setIsVerifying(true);
    setIsError(false);
    setErrorMessage('');

    try {
      const response = await api.post('/v1/auth/verify-otp', {
        mobile: mobile,
        otp: otpValue
      });

      if (response.data.success) {
        setIsSuccess(true);
        // Save token to auth store
        setAuth(
          response.data.data.user,
          response.data.data.accessToken
        );

        // Redirect based on onboarding status
        setTimeout(() => {
          if (!response.data.data.user.onboardingCompleted) {
            router.push('/onboarding/profile');
          } else {
            const role = response.data.data.user.role || 'farmer';
            router.push(`/${role.toLowerCase()}/dashboard`);
          }
        }, 1500);
      }
    } catch (error: any) {
      setIsError(true);
      setErrorMessage(error.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    try {
      await api.post('/v1/auth/otp/resend', { mobile });
      setTimeLeft(60);
      setIsError(false);
      setErrorMessage('');
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Failed to resend OTP.');
    }
  };

  const handleChangeMobile = () => {
    // Navigate back to the first step of registration where mobile is entered
    router.push(`/register/${regData.role.toLowerCase() || 'farmer'}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black/95 text-white p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-green-500/10 blur-[120px]" />
        <div className="absolute top-[40%] right-[10%] w-[30%] h-[30%] rounded-full bg-emerald-500/10 blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#050805]/80 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl relative z-10"
      >
        <button 
          onClick={handleChangeMobile}
          className="flex items-center text-sm text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Verify Mobile</h1>
          <p className="text-gray-400">
            We've sent a 6-digit code to<br />
            <span className="text-white font-medium">+91 {mobile}</span>
          </p>
        </div>

        <div className="mb-8">
          <OTPInput 
            length={6} 
            onComplete={handleVerify}
            isError={isError}
          />
        </div>

        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center text-green-500 py-4"
            >
              <CheckCircle2 className="w-12 h-12 mb-2" />
              <p className="font-medium">Verification Successful!</p>
              <p className="text-sm text-green-500/70 mt-1">Redirecting to dashboard...</p>
            </motion.div>
          ) : (
            <motion.div key="controls" className="space-y-6" exit={{ opacity: 0 }}>
              {isError && (
                <div className="flex items-center justify-center text-red-500 text-sm bg-red-500/10 py-2 px-4 rounded-lg">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {errorMessage}
                </div>
              )}

              <div className="flex flex-col items-center justify-center gap-2">
                <div className="text-sm text-gray-400">
                  {timeLeft > 0 ? (
                    <span>
                      Resend code in <span className="text-white font-mono">{String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}</span>
                    </span>
                  ) : (
                    <span className="text-red-400 font-medium">OTP Expired</span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm mt-2">
                  <button
                    onClick={handleResend}
                    disabled={timeLeft > 0 || isVerifying}
                    className="text-primary hover:text-primary-hover disabled:opacity-50 disabled:hover:text-primary transition-colors font-medium"
                  >
                    Resend OTP
                  </button>
                  <span className="text-gray-600">•</span>
                  <button
                    onClick={handleChangeMobile}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Change Mobile
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
