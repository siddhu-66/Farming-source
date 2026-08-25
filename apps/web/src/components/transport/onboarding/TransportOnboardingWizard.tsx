"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTransportOnboardingStore } from "@/stores/transportOnboardingStore";

import { CompanyInfoStep } from "./steps/CompanyInfoStep";
import { DriverInfoStep } from "./steps/DriverInfoStep";
import { VehicleRegistrationStep } from "./steps/VehicleRegistrationStep";
import { VehicleDocumentsStep } from "./steps/VehicleDocumentsStep";
import { ServiceAreaStep } from "./steps/ServiceAreaStep";
import { PricingAvailabilityStep } from "./steps/PricingAvailabilityStep";
import { BankDetailsStep } from "./steps/BankDetailsStep";
import { ReviewSubmitStep } from "./steps/ReviewSubmitStep";

const steps = [
  { id: 1, title: "Company Info" },
  { id: 2, title: "Driver Info" },
  { id: 3, title: "Vehicles" },
  { id: 4, title: "Vehicle Docs" },
  { id: 5, title: "Service Area" },
  { id: 6, title: "Pricing" },
  { id: 7, title: "Bank Details" },
  { id: 8, title: "Review" },
];

export function TransportOnboardingWizard() {
  const currentStep = useTransportOnboardingStore((state) => state.currentStep);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <CompanyInfoStep />;
      case 2:
        return <DriverInfoStep />;
      case 3:
        return <VehicleRegistrationStep />;
      case 4:
        return <VehicleDocumentsStep />;
      case 5:
        return <ServiceAreaStep />;
      case 6:
        return <PricingAvailabilityStep />;
      case 7:
        return <BankDetailsStep />;
      case 8:
        return <ReviewSubmitStep />;
      default:
        return <CompanyInfoStep />;
    }
  };

  return (
    <div className="flex flex-col w-full h-full min-h-[600px]">
      {/* Header / Stepper */}
      <div className="bg-green-700 text-white p-6">
        <h1 className="text-2xl font-bold mb-4">Transport Onboarding</h1>
        <div className="flex flex-wrap gap-2">
          {steps.map((s) => (
            <div
              key={s.id}
              className={`px-3 py-1 text-sm rounded-full ${
                currentStep === s.id
                  ? "bg-white text-green-700 font-semibold"
                  : currentStep > s.id
                  ? "bg-green-600 text-green-100"
                  : "bg-green-800 text-green-300"
              }`}
            >
              {s.id}. {s.title}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 relative overflow-hidden flex-grow flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="flex-grow"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
