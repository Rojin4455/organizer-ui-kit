import React, { useState, useEffect } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { FormStepper } from '../shared/FormStepper';
import { RentalEntityInfo } from './sections/RentalEntityInfo';
import { RentalOwnerInfo } from './sections/RentalOwnerInfo';
import { RentalPropertyInfo } from './sections/RentalPropertyInfo';
import { RentalIncomeExpenses } from './sections/RentalIncomeExpenses';
import { RentalReview } from './sections/RentalReview';

export const RentalPropertyOrganizer = ({
  onSave,
  onBack,
  initialData = {},
  userId,
  isLoading = false,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useVerticalStepper, setUseVerticalStepper] = useState(true);
  const [formData, setFormData] = useState({
    entityInfo: {},
    ownerInfo: {},
    propertyInfo: {},
    incomeExpenses: {},
    notes: {},
  });

  // Update formData when initialData changes
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      const dataToSet = initialData.submission_data || initialData;
      
      // Check if we have actual form data and current form is empty
      if (dataToSet && (dataToSet.entityInfo || dataToSet.ownerInfo || dataToSet.propertyInfo)) {
        setFormData({
          entityInfo: dataToSet.entityInfo || {},
          ownerInfo: dataToSet.ownerInfo || {},
          propertyInfo: dataToSet.propertyInfo || {},
          incomeExpenses: dataToSet.incomeExpenses || {},
          notes: dataToSet.notes || {},
        });
      }
    }
  }, [initialData]);

  const steps = [
    {
      label: 'Entity Information',
      description: 'Business details and entity type',
      component: RentalEntityInfo,
      dataKey: 'entityInfo',
      icon: <HomeIcon />,
    },
    {
      label: 'Owner Information',
      description: 'Property owner details',
      component: RentalOwnerInfo,
      dataKey: 'ownerInfo',
      icon: <HomeIcon />,
    },
    {
      label: 'Property Information',
      description: 'Rental property details',
      component: RentalPropertyInfo,
      dataKey: 'propertyInfo',
      icon: <HomeIcon />,
    },
    {
      label: 'Income & Expenses',
      description: 'Property income and expense details',
      component: RentalIncomeExpenses,
      dataKey: 'incomeExpenses',
      icon: <HomeIcon />,
    },
    {
      label: 'Review & Submit',
      description: 'Review and submit your rental property organizer',
      component: RentalReview,
      dataKey: 'review',
      icon: <HomeIcon />,
    },
  ];

  const handleStepChange = (step) => {
    setActiveStep(step);
  };

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleDataChange = (stepKey, data) => {
    setFormData(prev => ({
      ...prev,
      [stepKey]: data,
    }));
  };

  const handleSave = async (isCompleted = false) => {
    setIsSubmitting(true);
    try {
      const dataToSave = {
        ...formData,
        isCompleted
      };
      await onSave(dataToSave, isCompleted);
    } catch (error) {
      console.error('Error saving form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentStep = steps[activeStep];
  const StepComponent = currentStep.component;

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
      <AppBar position="static" sx={{ bgcolor: 'primary.main' }}>
        <Toolbar>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
            sx={{ color: 'white', mr: 2 }}
          >
            Back to Forms
          </Button>
          <HomeIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Rental Property Organizer
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={useVerticalStepper}
                onChange={(e) => setUseVerticalStepper(e.target.checked)}
                color="default"
              />
            }
            label="Vertical Layout"
            sx={{ color: 'white', mr: 2 }}
          />
          <Button
            startIcon={<SaveIcon />}
            onClick={() => handleSave(false)}
            variant="outlined"
            sx={{ 
              color: 'white', 
              borderColor: 'white',
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }
            }}
            disabled={isLoading || isSubmitting}
          >
            Save Progress
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 3 }}>
        <FormStepper
          steps={steps}
          activeStep={activeStep}
          onStepChange={handleStepChange}
          vertical={useVerticalStepper}
        />

        <Box sx={{ mt: 3 }}>
          <StepComponent
            data={formData[currentStep.dataKey] || {}}
            formData={formData}
            onChange={(data) => handleDataChange(currentStep.dataKey, data)}
            onNext={handleNext}
            onBack={handleBack}
            onSave={handleSave}
            isLastStep={activeStep === steps.length - 1}
            isFirstStep={activeStep === 0}
            isSubmitting={isSubmitting}
            userId={userId}
          />
        </Box>
      </Container>
    </Box>
  );
};