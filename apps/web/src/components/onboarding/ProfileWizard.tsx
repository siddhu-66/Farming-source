"use client";

import { useOnboardingStore } from '@/stores/onboardingStore';
import { motion, AnimatePresence } from 'framer-motion';
import { PersonalProfileStep } from './steps/PersonalProfileStep';
import { ProfilePhotoStep } from './steps/ProfilePhotoStep';
import { AddressConfirmationStep } from './steps/AddressConfirmationStep';
import { PreferencesStep } from './steps/PreferencesStep';
import { DashboardPersonalizationStep } from './steps/DashboardPersonalizationStep';
import { ReviewCompleteStep } from './steps/ReviewCompleteStep';
import { Leaf } from 'lucide-react';

const steps = [
  { id: 1, title: 'Personal Profile' },
  { id: 2, title: 'Profile Photo' },
  { id: 3, title: 'Address Confirmation' },
  { id: 4, title: 'Preferences' },
  { id: 5, title: 'Personalization' },
  { id: 6, title: 'Review & Complete' },
];

export function ProfileWizard() {
  const { currentStep, setStep } = useOnboardingStore();

  const handleNext = () => setStep(Math.min(currentStep + 1, steps.length));
  const handlePrev = () => setStep(Math.max(currentStep - 1, 1));

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <PersonalProfileStep onNext={handleNext} />;
      case 2: return <ProfilePhotoStep onNext={handleNext} onPrev={handlePrev} />;
      case 3: return <AddressConfirmationStep onNext={handleNext} onPrev={handlePrev} />;
      case 4: return <PreferencesStep onNext={handleNext} onPrev={handlePrev} />;
      case 5: return <DashboardPersonalizationStep onNext={handleNext} onPrev={handlePrev} />;
      case 6: return <ReviewCompleteStep onPrev={handlePrev} setStep={setStep} />;
      default: return null;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto min-h-screen py-12 px-4 sm:px-6">
      
      {/* Header */}
      <div className="flex flex-col items-center justify-center mb-8">
        <div className="bg-primary/10 p-3 rounded-full mb-4">
          <Leaf className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-center">Complete Your Profile</h2>
        <p className="text-muted-foreground text-center mt-2">Just a few more steps to personalize your AgriAssist experience.</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          
          {steps.map((step) => (
            <div 
              key={step.id} 
              className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors duration-300 ${
                currentStep >= step.id 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'bg-muted text-muted-foreground border-2 border-background'
              }`}
            >
              {step.id}
            </div>
          ))}
        </div>
        <div className="text-center mt-4 text-sm font-medium text-primary">
          Step {currentStep}: {steps[currentStep - 1].title}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-card text-card-foreground border rounded-xl shadow-sm p-6 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
      
    </div>
  );
}
