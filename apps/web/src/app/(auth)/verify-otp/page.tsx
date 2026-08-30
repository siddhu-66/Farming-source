'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { OTPInput } from '@/components/auth/OTPInput';
import { useRegistrationStore } from '@/stores/registrationStore';
import api from '@/lib/api';
import { ArrowLeft, CheckCircle2, AlertCircle, RefreshCw, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

function VerifyOTPContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: regData } = useRegistrationStore();
  const { setAuth } = useAuthStore();

  const [mobile, setMobile] = useState('');
  const [maskedPhone, setMaskedPhone] = useState('');
  const [role, setRole] = useState('farmer');
  const [currentOtp, setCurrentOtp] = useState('');

  const [timeLeft, setTimeLeft] = useState(60);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check URL search params first (most reliable after registration redirect)
    const phoneFromUrl = searchParams.get('phone');
    const maskedFromUrl = searchParams.get('masked');
    const roleFromUrl = searchParams.get('role');
    const phoneFromStore = regData?.personalInfo?.phone;
    const roleFromStore = regData?.role;

    // Check sessionStorage fallback
    let phoneFromStorage = '';
    let maskedFromStorage = '';
    let roleFromStorage = '';
    if (typeof window !== 'undefined') {
      phoneFromStorage = sessionStorage.getItem('agriassist_pending_phone') || '';
      maskedFromStorage = sessionStorage.getItem('agriassist_pending_masked_phone') || '';
      roleFromStorage = sessionStorage.getItem('agriassist_pending_role') || '';
    }

    const phoneToUse = phoneFromUrl || phoneFromStore || phoneFromStorage;
    const maskedToUse = maskedFromUrl || maskedFromStorage || '';
    const roleToUse = roleFromUrl || roleFromStore || roleFromStorage || 'farmer';

    if (phoneToUse) {
      setMobile(decodeURIComponent(phoneToUse));
      setMaskedPhone(maskedToUse ? decodeURIComponent(maskedToUse) : '');
      setRole(decodeURIComponent(roleToUse));

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('agriassist_pending_phone', phoneToUse);
        if (maskedToUse) {
          sessionStorage.setItem('agriassist_pending_masked_phone', maskedToUse);
        }
        if (roleToUse) {
          sessionStorage.setItem('agriassist_pending_role', roleToUse);
        }
      }
    }
    setIsReady(true);
  }, [searchParams, regData]);

  useEffect(() => {
    if (timeLeft > 0 && !isSuccess) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, isSuccess]);

  const handleVerify = async (otpValue?: string) => {
    const code = (otpValue || currentOtp).trim();
    if (code.length !== 6) {
      setIsError(true);
      setErrorMessage('Please enter all 6 digits of the verification code.');
      return;
    }

    if (!mobile) {
      setIsError(true);
      setErrorMessage('Missing phone number for verification. Please return to registration.');
      return;
    }

    setIsVerifying(true);
    setIsError(false);
    setErrorMessage('');
    setStatusMessage('');

    try {
      const response = await api.post('/v1/auth/verify-otp', {
        phone: mobile,
        otp: code
      });

      if (response.data?.success) {
        setIsSuccess(true);
        setStatusMessage('Mobile number verified successfully!');

        // Save tokens & user to auth store
        const userData = response.data.data.user;
        const accessToken = response.data.data.accessToken;
        const refreshToken = response.data.data.refreshToken;

        setAuth(userData, accessToken, refreshToken);

        // Clear pending registration state from storage
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('agriassist_pending_phone');
          sessionStorage.removeItem('agriassist_pending_masked_phone');
          sessionStorage.removeItem('agriassist_pending_role');
        }

        // Navigate to role dashboard or profile onboarding
        setTimeout(() => {
          const userRole = userData?.role || role || 'farmer';
          if (userData && !userData.profileCompleted && !userData.onboardingCompleted) {
            router.push('/onboarding/profile');
          } else {
            router.push(`/${userRole.toLowerCase()}/dashboard`);
          }
        }, 1500);
      } else {
        setIsError(true);
        setErrorMessage(response.data?.message || 'Verification failed. Please try again.');
      }
    } catch (error: any) {
      setIsError(true);
      const status = error.response?.status;
      const serverMessage = error.response?.data?.message || error.message;
      if (status === 429) {
        setErrorMessage('Too many verification attempts. Please wait a few minutes, then request a new OTP.');
        // Force a cooldown so they don't hammer the verify endpoint
        setTimeLeft(180);
      } else {
        setErrorMessage(serverMessage || 'Invalid verification code. Please try again.');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (timeLeft > 0 || isResending || isVerifying || !mobile) return;

    setIsResending(true);
    setIsError(false);
    setErrorMessage('');
    setStatusMessage('');

    try {
      const response = await api.post('/v1/auth/resend-otp', { phone: mobile });
      setTimeLeft(60);
      setStatusMessage(response.data?.message || 'A fresh OTP code has been sent via SMS.');
    } catch (error: any) {
      setIsError(true);
      const status = error.response?.status;
      const serverMsg = error.response?.data?.message;
      if (status === 429) {
        // Twilio rate limit — back off for 3 minutes
        setTimeLeft(180);
        setErrorMessage(serverMsg || 'Too many SMS requests. Please wait 3 minutes before retrying.');
      } else {
        setErrorMessage(serverMsg || 'Failed to resend SMS code. Please try again later.');
      }
    } finally {
      setIsResending(false);
    }
  };

  const handleChangeMobile = () => {
    const roleToNav = role.toLowerCase() || 'farmer';
    router.push(`/register/${roleToNav}`);
  };

  if (isReady && !mobile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black/95 text-white p-4 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-[#050805]/90 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl text-center space-y-6"
        >
          <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto text-amber-400">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold">No Pending Verification Found</h2>
          <p className="text-gray-400 text-sm">
            We could not find an active registration session. Please start registration or log in to your existing account.
          </p>
          <div className="pt-2 space-y-3">
            <Button
              onClick={() => router.push('/register/role-selection')}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl"
            >
              Go to Registration
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/login')}
              className="w-full border-white/10 text-gray-300 hover:text-white hover:bg-white/5 py-3 rounded-xl"
            >
              Go to Login
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  const formattedDisplayPhone = maskedPhone || (mobile.startsWith('+') ? mobile : `+91 ${mobile}`);

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
        className="w-full max-w-md bg-[#050805]/90 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl relative z-10"
      >
        <button
          onClick={handleChangeMobile}
          className="flex items-center text-sm text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Registration
        </button>

        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-green-400 border border-green-500/20">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Verify Mobile Number</h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            We have sent a 6-digit SMS verification code to<br />
            <span className="text-white font-semibold tracking-wide text-base">{formattedDisplayPhone}</span>
          </p>
        </div>

        <div className="mb-6">
          <OTPInput
            length={6}
            onComplete={(val) => {
              setCurrentOtp(val);
              handleVerify(val);
            }}
            isError={isError}
          />
        </div>

        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center text-green-400 py-4 text-center space-y-2"
            >
              <CheckCircle2 className="w-12 h-12" />
              <p className="font-bold text-lg">Verification Approved!</p>
              <p className="text-sm text-gray-400">Setting up your secure session and redirecting...</p>
            </motion.div>
          ) : (
            <motion.div key="controls" className="space-y-5" exit={{ opacity: 0 }}>
              {isError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start text-red-400 text-sm bg-red-500/10 border border-red-500/20 py-3 px-4 rounded-xl leading-snug"
                >
                  <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </motion.div>
              )}

              {statusMessage && !isError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center text-green-400 text-sm bg-green-500/10 border border-green-500/20 py-2.5 px-4 rounded-xl justify-center"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>{statusMessage}</span>
                </motion.div>
              )}

              <Button
                onClick={() => handleVerify()}
                disabled={isVerifying || isSuccess}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] flex items-center justify-center"
              >
                {isVerifying ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Verifying Code...
                  </span>
                ) : (
                  'Verify OTP & Continue'
                )}
              </Button>

              <div className="flex flex-col items-center justify-center gap-2 pt-2 border-t border-white/5">
                <div className="text-sm text-gray-400">
                  {timeLeft > 0 ? (
                    <span>
                      Resend SMS code in <span className="text-green-400 font-mono font-semibold">{String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}</span>
                    </span>
                  ) : (
                    <span className="text-amber-400 font-medium">OTP code expired or didn't receive?</span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm mt-1">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={timeLeft > 0 || isResending || isVerifying}
                    className="text-green-400 hover:text-green-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors font-semibold flex items-center gap-1.5"
                  >
                    {isResending ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Resending...
                      </>
                    ) : (
                      'Resend OTP'
                    )}
                  </button>
                  <span className="text-gray-600">•</span>
                  <button
                    type="button"
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

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black/95 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading verification session...</p>
        </div>
      </div>
    }>
      <VerifyOTPContent />
    </Suspense>
  );
}
