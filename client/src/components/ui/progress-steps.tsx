import * as React from "react";
import { cn } from "@/lib/utils";

interface StepProps {
  title: string;
  children?: React.ReactNode;
  active?: boolean;
  completed?: boolean;
  last?: boolean;
}

const Step = React.forwardRef<HTMLDivElement, StepProps>(
  ({ title, children, active, completed, last, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className="flex items-center"
        {...props}
      >
        <div className="flex items-center">
          <div className={cn(
            "rounded-full h-8 w-8 flex items-center justify-center",
            completed || active ? "bg-primary text-white" : "bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          )}>
            {children}
          </div>
          {!last && (
            <div className={cn(
              "mx-2 h-1 w-12",
              completed ? "bg-primary" : "bg-gray-300 dark:bg-gray-700"
            )}></div>
          )}
        </div>
      </div>
    );
  }
);
Step.displayName = "Step";

interface ProgressStepsProps extends React.HTMLAttributes<HTMLDivElement> {
  steps: { title: string; content: React.ReactNode }[];
  currentStep: number;
}

const ProgressSteps = React.forwardRef<HTMLDivElement, ProgressStepsProps>(
  ({ steps, currentStep, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("mb-8", className)} {...props}>
        <div className="flex items-center justify-center">
          {steps.map((step, index) => (
            <Step
              key={index}
              title={step.title}
              active={index === currentStep - 1}
              completed={index < currentStep - 1}
              last={index === steps.length - 1}
            >
              {index + 1}
            </Step>
          ))}
        </div>
        <div className="flex justify-between mt-1 text-sm text-gray-600 dark:text-gray-400">
          {steps.map((step, index) => (
            <div
              key={index}
              className={cn(
                index <= currentStep - 1 ? "text-primary-600 dark:text-primary-400 font-medium" : ""
              )}
            >
              {step.title}
            </div>
          ))}
        </div>
      </div>
    );
  }
);
ProgressSteps.displayName = "ProgressSteps";

export { ProgressSteps, Step };
