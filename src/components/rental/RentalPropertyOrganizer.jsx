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
        setFormData(prev => {
          const hasExistingData = Object.keys(prev.entityInfo).length > 0 || 
                                 Object.keys(prev.ownerInfo).length > 0 ||
                                 Object.keys(prev.propertyInfo).length > 0;
          
          if (!hasExistingData) {
            return {
              entityInfo: dataToSet.entityInfo || {},
              ownerInfo: dataToSet.ownerInfo || {},
              propertyInfo: dataToSet.propertyInfo || {},
              incomeExpenses: dataToSet.incomeExpenses || {},
              notes: dataToSet.notes || {},
            };
          }
          return prev;
        });
      }
    }
  }, [initialData]);

  // Auto-save functionality
  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem('rentalPropertyData', JSON.stringify(formData));
    }, 1000);
    return () => clearTimeout(timeout);
  }, [formData]);

  const updateFormData = (section, data) => {
    setFormData(prev => ({
      ...prev,
      [section]: data,
    }));
  };

  const steps = [
    {
      id: 'entity-info',
      label: 'Entity Information',
      description: 'Business details and entity type',
      content: (
        <RentalEntityInfo
          data={formData.entityInfo}
          onChange={(data) => updateFormData('entityInfo', data)}
        />
      ),
      isCompleted: Boolean(formData.entityInfo.businessName || formData.entityInfo.propertyInName),
      isRequired: true,
    },
    {
      id: 'owner-info',
      label: 'Owner Information',
      description: 'Property owner details',
      content: (
        <RentalOwnerInfo
          data={formData.ownerInfo}
          onChange={(data) => updateFormData('ownerInfo', data)}
        />
      ),
      isCompleted: Boolean(formData.ownerInfo.owners && formData.ownerInfo.owners[0]?.firstName),
      isRequired: true,
    },
    {
      id: 'property-info',
      label: 'Property Information',
      description: 'Rental property details',
      content: (
        <RentalPropertyInfo
          data={formData.propertyInfo}
          onChange={(data) => updateFormData('propertyInfo', data)}
        />
      ),
      isCompleted: Boolean(formData.propertyInfo.propertyAddress),
      isRequired: true,
    },
    {
      id: 'income-expenses',
      label: 'Income & Expenses',
      description: 'Property income and expense details',
      content: (
        <RentalIncomeExpenses
          data={formData.incomeExpenses}
          onChange={(data) => updateFormData('incomeExpenses', data)}
        />
      ),
      isCompleted: true, // Optional section
      isRequired: false,
    },
    {
      id: 'review',
      label: 'Review & Submit',
      description: 'Review and submit your rental property organizer',
      content: (
        <RentalReview
          data={formData.notes || {}}
          formData={formData}
          onChange={(data) => updateFormData('notes', data)}
          onSave={handleSubmit}
          isSubmitting={isSubmitting}
        />
      ),
      isCompleted: false,
      isRequired: true,
    },
  ];

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleStepChange = (stepIndex) => {
    setActiveStep(stepIndex);
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      onSave(formData, true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveProgress = async () => {
    try {
      await onSave(formData, false);
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" elevation={0} sx={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
        <Toolbar>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
            sx={{ mr: 2, color: '#64748b' }}
          >
            Back
          </Button>
          <HomeIcon sx={{ mr: 2, color: '#f97316' }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: '#1e293b', fontWeight: 600 }}>
            Rental Property Organizer
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={useVerticalStepper}
                onChange={(e) => setUseVerticalStepper(e.target.checked)}
                size="small"
              />
            }
            label="Vertical Layout"
            sx={{ mr: 2, color: '#64748b' }}
          />
          <Button
            startIcon={<SaveIcon />}
            onClick={handleSaveProgress}
            variant="outlined"
            size="small"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Progress'}
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
        <FormStepper
          steps={steps}
          activeStep={activeStep}
          onStepChange={handleStepChange}
          onNext={handleNext}
          onBack={handleBack}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel="Submit Rental Property Organizer"
          orientation={useVerticalStepper ? 'vertical' : 'horizontal'}
        />
      </Container>
    </Box>
  );
};