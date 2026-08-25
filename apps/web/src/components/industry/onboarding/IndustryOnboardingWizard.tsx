"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useIndustryOnboardingStore } from "@/stores/industryOnboardingStore";

import CompanyInfoStep from "./steps/CompanyInfoStep";
import BusinessVerificationStep from "./steps/BusinessVerificationStep";
import FactoryInfoStep from "./steps/FactoryInfoStep";
import WarehouseSetupStep from "./steps/WarehouseSetupStep";
import ProcurementRequirementsStep from "./steps/ProcurementRequirementsStep";
import ProcessingCapacityStep from "./steps/ProcessingCapacityStep";
import BankingFinanceStep from "./steps/BankingFinanceStep";
import ReviewSubmitStep from "./steps/ReviewSubmitStep";

const steps = [
  { id: 1, title: "Company Info" },
  { id: 2, title: "Verification" },
  { id: 3, title: "Factory" },
  { id: 4, title: "Warehouses" },
  { id: 5, title: "Procurement" },
  { id: 6, title: "Capacity" },
  { id: 7, title: "Banking" },
  { id: 8, title: "Review" },
];

export default function IndustryOnboardingWizard() {
  const currentStep = useIndustryOnboardingStore((state) => state.currentStep);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <CompanyInfoStep />;
      case 2: return <BusinessVerificationStep />;
      case 3: return <FactoryInfoStep />;
      case 4: return <WarehouseSetupStep />;
      case 5: return <ProcurementRequirementsStep />;
      case 6: return <ProcessingCapacityStep />;
      case 7: return <BankingFinanceStep />;
      case 8: return <ReviewSubmitStep />;
      default: return <CompanyInfoStep />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden min-h-[600px] flex flex-col">
      <div className="bg-green-700 px-6 py-4">
        <h2 className="text-2xl font-bold text-white">Industry Registration</h2>
        <div className="mt-4 flex items-center justify-between">
          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors duration-300 ${
                  currentStep >= step.id
                    ? "bg-white text-green-700"
                    : "bg-green-800 text-gray-300"
                }`}
              >
                {step.id}
              </div>
              <span
                className={`text-xs mt-2 hidden sm:block ${
                  currentStep >= step.id ? "text-white font-medium" : "text-green-200"
                }`}
              >
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 flex-grow relative overflow-hidden bg-gray-50">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
