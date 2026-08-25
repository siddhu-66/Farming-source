"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAdminOnboardingStore } from "@/stores/adminOnboardingStore";

import { AdminProfileStep } from "./steps/AdminProfileStep";
import { SecurityConfigStep } from "./steps/SecurityConfigStep";
import { WorkspacePreferencesStep } from "./steps/WorkspacePreferencesStep";
import { PermissionReviewStep } from "./steps/PermissionReviewStep";
import { NotificationsStep } from "./steps/NotificationsStep";
import { ReviewSubmitStep } from "./steps/ReviewSubmitStep";

const steps = [
  { id: 1, title: "Profile Setup", component: AdminProfileStep },
  { id: 2, title: "Security Configuration", component: SecurityConfigStep },
  { id: 3, title: "Workspace Preferences", component: WorkspacePreferencesStep },
  { id: 4, title: "Permission Review", component: PermissionReviewStep },
  { id: 5, title: "Notifications Setup", component: NotificationsStep },
  { id: 6, title: "Review & Submit", component: ReviewSubmitStep },
];

export function AdminOnboardingWizard() {
  const { currentStep, setStep } = useAdminOnboardingStore();

  const handleNext = () => {
    if (currentStep < steps.length) {
      setStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setStep(currentStep - 1);
    }
  };

  const CurrentComponent = steps.find((s) => s.id === currentStep)?.component;

  return (
    <div className="max-w-3xl mx-auto w-full p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Setup</h1>
        <p className="text-gray-500 mt-2 text-sm">
          Complete your profile and configure your workspace to get started.
        </p>

        {/* Progress Bar */}
        <div className="mt-8 flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-800 -z-10 transform -translate-y-1/2"></div>
          {steps.map((step) => {
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;

            return (
              <div key={step.id} className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                      : isCompleted
                      ? "bg-primary text-primary-foreground"
                      : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.id
                  )}
                </div>
                <span className={`mt-2 text-xs font-medium hidden sm:block ${isActive ? "text-primary" : "text-gray-500"}`}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-6 md:p-8 overflow-hidden relative min-h-[400px]">
        <h2 className="text-xl font-semibold mb-6">
          {steps.find((s) => s.id === currentStep)?.title}
        </h2>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {CurrentComponent && (
              <CurrentComponent onNext={handleNext} onBack={handleBack} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
