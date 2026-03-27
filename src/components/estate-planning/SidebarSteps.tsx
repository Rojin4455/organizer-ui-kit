import React from 'react';
import { useEstateForm } from '../../contexts/EstateFormContext';
import { cn } from '@/lib/utils';

const SidebarSteps: React.FC = () => {
    const { currentStep, steps } = useEstateForm();

    return (
        <div className="flex flex-col space-y-2 w-full md:w-64 md:border-r border-muted md:pr-6 md:min-h-[400px]">
            {steps.map((step) => {
                const isActive = currentStep === step.id;
                const Icon = step.icon;
                return (
                    <div
                        key={step.id}
                        className={cn(
                            "flex items-center gap-4 p-3 rounded-xl transition-all",
                            isActive ? "" : "opacity-70"
                        )}
                    >
                        <div
                            className={cn(
                                "flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0 transition-colors",
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-md"
                                    : "bg-background text-muted-foreground border"
                            )}
                        >
                            <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                            <span
                                className={cn(
                                    "text-sm font-semibold tracking-tight",
                                    isActive ? "text-foreground" : "text-muted-foreground"
                                )}
                            >
                                {step.title}
                            </span>
                            <span
                                className={cn(
                                    "text-xs",
                                    isActive ? "text-muted-foreground" : "text-muted-foreground/70"
                                )}
                            >
                                {step.description}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default SidebarSteps;
