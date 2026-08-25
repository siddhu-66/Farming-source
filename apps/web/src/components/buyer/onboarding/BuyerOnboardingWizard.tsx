"use client";

import { useBuyerOnboardingStore } from "@/stores/buyerOnboardingStore";
import { AnimatePresence, motion } from "framer-motion";
import BusinessInfoStep from "./steps/BusinessInfoStep";
import BusinessVerificationStep from "./steps/BusinessVerificationStep";
import WarehouseDetailsStep from "./steps/WarehouseDetailsStep";
import ProcurementPreferencesStep from "./steps/ProcurementPreferencesStep";
import DeliveryBillingStep from "./steps/DeliveryBillingStep";
import PaymentPreferencesStep from "./steps/PaymentPreferencesStep";
import ReviewSubmitStep from "./steps/ReviewSubmitStep";

const stepVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
};

export default function BuyerOnboardingWizard() {
  const currentStep = useBuyerOnboardingStore((state) => state.currentStep);

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium text-muted-foreground">
            Step {currentStep} of 7
          </span>
        </div>
        <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-300"
            style={{ width: `${(currentStep / 7) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-card text-card-foreground shadow-sm border rounded-xl p-6 md:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            {currentStep === 1 && <BusinessInfoStep />}
            {currentStep === 2 && <BusinessVerificationStep />}
            {currentStep === 3 && <WarehouseDetailsStep />}
            {currentStep === 4 && <ProcurementPreferencesStep />}
            {currentStep === 5 && <DeliveryBillingStep />}
            {currentStep === 6 && <PaymentPreferencesStep />}
            {currentStep === 7 && <ReviewSubmitStep />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
