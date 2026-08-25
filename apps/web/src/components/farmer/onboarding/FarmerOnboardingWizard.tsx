"use client";

import { useFarmerOnboardingStore } from '@/stores/farmerOnboardingStore';
import { motion, AnimatePresence } from 'framer-motion';
import { FarmInfoStep } from './steps/FarmInfoStep';
import { FarmLocationStep } from './steps/FarmLocationStep';
import { CropDetailsStep } from './steps/CropDetailsStep';
import { IrrigationStep } from './steps/IrrigationStep';
import { EquipmentStep } from './steps/EquipmentStep';
import { StorageLivestockStep } from './steps/StorageLivestockStep';
import { GovernmentSchemesStep } from './steps/GovernmentSchemesStep';
import { ReviewCompleteStep } from './steps/ReviewCompleteStep';
import { Leaf } from 'lucide-react';

const steps = [
  { id: 1, title: 'Farm Info' },
  { id: 2, title: 'Location' },
  { id: 3, title: 'Crops' },
  { id: 4, title: 'Irrigation' },
  { id: 5, title: 'Equipment' },
  { id: 6, title: 'Storage & Livestock' },
  { id: 7, title: 'Government Schemes' },
  { id: 8, title: 'Review & Submit' },
];

export function FarmerOnboardingWizard() {
  const { currentStep, setStep } = useFarmerOnboardingStore();

  const handleNext = () => setStep(Math.min(currentStep + 1, steps.length));
  const handlePrev = () => setStep(Math.max(currentStep - 1, 1));

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <FarmInfoStep onNext={handleNext} />;
      case 2: return <FarmLocationStep onNext={handleNext} onPrev={handlePrev} />;
      case 3: return <CropDetailsStep onNext={handleNext} onPrev={handlePrev} />;
      case 4: return <IrrigationStep onNext={handleNext} onPrev={handlePrev} />;
      case 5: return <EquipmentStep onNext={handleNext} onPrev={handlePrev} />;
      case 6: return <StorageLivestockStep onNext={handleNext} onPrev={handlePrev} />;
      case 7: return <GovernmentSchemesStep onNext={handleNext} onPrev={handlePrev} />;
      case 8: return <ReviewCompleteStep onPrev={handlePrev} setStep={setStep} />;
      default: return null;
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto min-h-screen py-8 px-4 sm:px-6">
      
      {/* Header */}
      <div className="flex flex-col items-center justify-center mb-6">
        <div className="bg-primary/10 p-3 rounded-full mb-3">
          <Leaf className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-center">Farmer Registration</h2>
        <p className="text-muted-foreground text-center mt-1">Complete your farm profile to access AI and marketplace features.</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
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
              className={`relative z-10 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors duration-300 ${
                currentStep >= step.id 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'bg-muted text-muted-foreground border-2 border-background'
              }`}
            >
              <span className="hidden sm:inline">{step.id}</span>
            </div>
          ))}
        </div>
        <div className="text-center mt-3 text-sm font-medium text-primary">
          Step {currentStep}: {steps[currentStep - 1].title}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-card text-card-foreground border rounded-xl shadow-sm p-5 sm:p-8 overflow-hidden">
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
