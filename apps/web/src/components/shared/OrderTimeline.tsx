import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TimelineStep {
  label: string;
  description?: string;
  status: 'completed' | 'current' | 'pending';
  date?: string;
}

export function OrderTimeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <div className="relative pl-8 space-y-8">
      {/* Vertical Line */}
      <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gray-200 dark:bg-gray-800" />
      
      {steps.map((step, i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.2 }}
          className="relative flex flex-col"
        >
          <div className="absolute -left-8 bg-white dark:bg-gray-900 rounded-full">
            {step.status === 'completed' ? (
              <CheckCircle className="h-6 w-6 text-green-500 bg-white dark:bg-gray-900 rounded-full" />
            ) : step.status === 'current' ? (
              <Clock className="h-6 w-6 text-primary bg-white dark:bg-gray-900 rounded-full animate-pulse" />
            ) : (
              <Circle className="h-6 w-6 text-gray-300 dark:text-gray-700 bg-white dark:bg-gray-900 rounded-full" />
            )}
          </div>
          <div className="flex justify-between items-start">
            <div>
              <h4 className={cn("font-semibold text-base", step.status === 'pending' ? 'text-gray-500' : '')}>
                {step.label}
              </h4>
              {step.description && <p className="text-sm text-gray-500 mt-1">{step.description}</p>}
            </div>
            {step.date && <span className="text-xs text-gray-400 font-medium">{step.date}</span>}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
