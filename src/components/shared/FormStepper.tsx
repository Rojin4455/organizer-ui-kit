import React from 'react';
import {
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Box,
  Button,
  Typography,
  Paper,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

export interface FormStep {
  id: string;
  label: string;
  description?: string;
  content: React.ReactNode;
  isCompleted?: boolean;
  hasErrors?: boolean;
  isRequired?: boolean;
  errorCount?: number;
}

interface FormStepperProps {
  steps: FormStep[];
  activeStep: number;
  onStepChange: (step: number) => void;
  onNext: () => void;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  orientation?: 'horizontal' | 'vertical';
}

export const FormStepper: React.FC<FormStepperProps> = ({
  steps,
  activeStep,
  onStepChange,
  onNext,
  onBack,
  onSubmit,
  isSubmitting = false,
  submitLabel = 'Complete',
  orientation = 'vertical',
}) => {
  const currentStep = steps[activeStep];
  const isLastStep = activeStep === steps.length - 1;
  const completedSteps = steps.filter(step => step.isCompleted).length;
  const totalSteps = steps.length;
  const progress = (completedSteps / totalSteps) * 100;

  const getStepIcon = (step: FormStep, stepIndex: number) => {
    if (step.hasErrors) {
      return <ErrorIcon sx={{ color: '#ef4444' }} />;
    }
    if (step.isCompleted) {
      return <CheckCircleIcon sx={{ color: '#22c55e' }} />;
    }
    if (step.isRequired && !step.isCompleted) {
      return <WarningIcon sx={{ color: '#f59e0b' }} />;
    }
    return stepIndex + 1;
  };

  return (
    <Box>
      {/* Progress Bar */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, backgroundColor: '#f8fafc' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Progress: {completedSteps} of {totalSteps} sections complete
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {Math.round(progress)}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: '#e2e8f0',
            '& .MuiLinearProgress-bar': {
              borderRadius: 4,
              backgroundColor: '#22c55e',
            },
          }}
        />
      </Paper>

      {orientation === 'vertical' ? (
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.id} completed={step.isCompleted}>
              <StepLabel
                icon={getStepIcon(step, index)}
                onClick={() => onStepChange(index)}
                sx={{ cursor: 'pointer' }}
                optional={
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    {step.isRequired && (
                      <Chip
                        label="Required"
                        size="small"
                        color="warning"
                        variant="outlined"
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                    )}
                    {step.errorCount && step.errorCount > 0 && (
                      <Chip
                        label={`${step.errorCount} error${step.errorCount > 1 ? 's' : ''}`}
                        size="small"
                        color="error"
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                    )}
                  </Box>
                }
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {step.label}
                </Typography>
                {step.description && (
                  <Typography variant="body2" color="text.secondary">
                    {step.description}
                  </Typography>
                )}
              </StepLabel>
              <StepContent>
                <Box sx={{ mb: 2 }}>
                  {step.content}
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {activeStep > 0 && (
                    <Button
                      onClick={onBack}
                      variant="outlined"
                      size="small"
                    >
                      Back
                    </Button>
                  )}
                  {isLastStep ? (
                    <Button
                      onClick={onSubmit}
                      variant="contained"
                      size="small"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Submitting...' : submitLabel}
                    </Button>
                  ) : (
                    <Button
                      onClick={onNext}
                      variant="contained"
                      size="small"
                    >
                      Next
                    </Button>
                  )}
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      ) : (
        <Box>
          <Stepper activeStep={activeStep} orientation="horizontal" sx={{ mb: 3 }}>
            {steps.map((step, index) => (
              <Step key={step.id} completed={step.isCompleted}>
                <StepLabel
                  icon={getStepIcon(step, index)}
                  onClick={() => onStepChange(index)}
                  sx={{ cursor: 'pointer' }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {step.label}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
          
          <Paper elevation={0} sx={{ p: 3, minHeight: 400 }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                {currentStep.label}
              </Typography>
              {currentStep.description && (
                <Typography variant="body2" color="text.secondary">
                  {currentStep.description}
                </Typography>
              )}
            </Box>
            
            {currentStep.content}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button
                onClick={onBack}
                disabled={activeStep === 0}
                variant="outlined"
              >
                Back
              </Button>
              {isLastStep ? (
                <Button
                  onClick={onSubmit}
                  variant="contained"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : submitLabel}
                </Button>
              ) : (
                <Button
                  onClick={onNext}
                  variant="contained"
                >
                  Next
                </Button>
              )}
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  );
};