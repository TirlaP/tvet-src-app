import React from 'react';
import { cn } from '../../lib/utils';
import { CheckIcon } from 'lucide-react';

type Step = {
  title: string;
  description?: string;
};

interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
  allowClickable?: boolean;
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  onStepClick,
  allowClickable = false,
  className,
}) => {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex justify-between">
        {steps.map((step, index) => {
          const isCompleted = currentStep > index + 1;
          const isCurrent = currentStep === index + 1;
          const isClickable = allowClickable && index + 1 < currentStep;
          
          return (
            <div 
              key={index}
              className={cn(
                "flex flex-col items-center relative",
                // For the first and last steps, align differently
                index === 0 ? "items-start" : index === steps.length - 1 ? "items-end" : "items-center",
                // Width calculation
                "w-full"
              )}
            >
              {/* Step Index Circle */}
              <div
                onClick={() => isClickable && onStepClick?.(index + 1)}
                className={cn(
                  "flex items-center justify-center rounded-full z-10 w-8 h-8",
                  isCompleted ? "bg-primary text-white" : 
                  isCurrent ? "bg-primary text-white" : "bg-gray-200 text-gray-500",
                  isClickable && "cursor-pointer hover:ring-2 hover:ring-primary/30"
                )}
              >
                {isCompleted ? (
                  <CheckIcon className="h-5 w-5" />
                ) : (
                  <span className="text-sm">{index + 1}</span>
                )}
              </div>
              
              {/* Step Title */}
              <div className="mt-2 text-center">
                <div
                  className={cn(
                    "text-sm font-medium",
                    isCompleted || isCurrent ? "text-primary" : "text-gray-500"
                  )}
                >
                  {step.title}
                </div>
                {step.description && (
                  <div className="text-xs text-gray-500 hidden sm:block">
                    {step.description}
                  </div>
                )}
              </div>
              
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div 
                  className={cn(
                    "absolute top-4 left-0 -translate-y-1/2 h-[2px] w-full",
                    // Don't extend the line all the way for first and last
                    index === 0 ? "left-4" : "",
                    index === steps.length - 2 ? "right-4 w-[calc(100%-16px)]" : ""
                  )}
                >
                  <div 
                    className={cn(
                      "h-full bg-gray-200",
                      isCompleted ? "bg-primary" : ""
                    )}
                    style={{
                      width: index < currentStep - 1 ? '100%' : 
                             index === currentStep - 1 ? '50%' : '0%'
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
