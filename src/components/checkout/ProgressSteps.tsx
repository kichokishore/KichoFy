import React from 'react';

interface ProgressStepsProps {
  currentStep: number;
  steps: string[];
}

export const ProgressSteps: React.FC<ProgressStepsProps> = ({ 
  currentStep, 
  steps 
}) => {
  return (
    <div className="flex items-center justify-center mb-6 sm:mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={step}>
          {/* Step Circle */}
          <div className="flex items-center">
            <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold ${
              index <= currentStep 
                ? 'bg-primary text-white' 
                : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
            }`}>
              {index + 1}
            </div>
            <div className={`ml-1 sm:ml-2 text-xs sm:text-sm font-medium ${
              index <= currentStep ? 'text-primary' : 'text-gray-500 dark:text-gray-400'
            }`}>
              {step}
            </div>
          </div>

          {/* Connector Line */}
          {index < steps.length - 1 && (
            <div className={`w-12 sm:w-16 h-1 mx-1 sm:mx-2 ${
              index < currentStep ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
            }`}></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};