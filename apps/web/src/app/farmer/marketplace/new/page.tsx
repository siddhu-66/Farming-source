'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useSellCropStore } from '@/stores/sellCropStore';
import api from '@/lib/api';

import { Step1CropInfo } from '@/components/farmer/sell-crop/Step1CropInfo';
import { Step2Images } from '@/components/farmer/sell-crop/Step2Images';
import { Step3Quality } from '@/components/farmer/sell-crop/Step3Quality';
import { Step4Pricing } from '@/components/farmer/sell-crop/Step4Pricing';
import { Step5Pickup } from '@/components/farmer/sell-crop/Step5Pickup';
import { Step6Review } from '@/components/farmer/sell-crop/Step6Review';

const steps = [
  'Crop Info',
  'Images',
  'Quality',
  'Pricing',
  'Pickup',
  'Review'
];

export default function SellCropWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const state = useSellCropStore();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo(0, 0);
    } else {
      router.back();
    }
  };

  const handlePublish = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const payload = {
        type: 'crop',
        title: `${state.quantity} ${state.unit} of ${state.cropName}`,
        description: state.description || 'No description provided.',
        quantity: Number(state.quantity),
        unit: state.unit,
        pricePerUnit: Number(state.pricePerUnit),
        minOrderQuantity: 1, // Defaulting for now
        cropName: state.cropName,
        cropVariety: state.cropVariety,
        organicCertified: state.organicCertified,
        tags: [state.cropCategory, state.qualityGrade].filter(Boolean),
        harvestDate: state.harvestDate,
        irrigationType: state.irrigationType,
        qualityGrade: state.qualityGrade,
        moisture: Number(state.moisture) || undefined,
        packagingType: state.packagingType,
        sellingMode: state.sellingMode,
        negotiable: state.negotiable,
        pickupDate: state.pickupDate,
        transportPreference: state.transportPreference,
        address: state.address
      };

      await api.post('/api/farmer/listings', payload);
      
      state.resetStore();
      router.push('/farmer/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to publish listing. Please check all required fields.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={handlePrev}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Sell Crop</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Save Draft</Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-12">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 -z-10 rounded-full"></div>
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary -z-10 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          ></div>
          
          {steps.map((step, index) => (
            <div key={step} className="flex flex-col items-center">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors ${
                  index < currentStep 
                    ? 'bg-primary border-primary text-white' 
                    : index === currentStep 
                      ? 'bg-white border-primary text-primary' 
                      : 'bg-white border-gray-300 text-gray-400'
                }`}
              >
                {index < currentStep ? <Check className="w-5 h-5" /> : index + 1}
              </div>
              <span className={`text-xs mt-2 font-medium hidden md:block ${index <= currentStep ? 'text-gray-900' : 'text-gray-400'}`}>
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Form Area */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border p-6 md:p-8 min-h-[400px] mb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {currentStep === 0 && <Step1CropInfo />}
            {currentStep === 1 && <Step2Images />}
            {currentStep === 2 && <Step3Quality />}
            {currentStep === 3 && <Step4Pricing />}
            {currentStep === 4 && <Step5Pickup />}
            {currentStep === 5 && <Step6Review />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start text-red-800">
          <AlertCircle className="w-5 h-5 mr-2 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center fixed bottom-0 left-0 md:left-64 right-0 p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t z-10">
        <Button variant="outline" onClick={handlePrev} size="lg">
          {currentStep === 0 ? 'Cancel' : 'Back'}
        </Button>
        
        {currentStep < steps.length - 1 ? (
          <Button onClick={handleNext} size="lg">
            Continue to Next Step
          </Button>
        ) : (
          <Button onClick={handlePublish} size="lg" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
            {isSubmitting ? 'Publishing...' : 'Publish Listing'}
          </Button>
        )}
      </div>
    </div>
  );
}
