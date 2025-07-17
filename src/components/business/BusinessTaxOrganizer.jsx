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
  Business as BusinessIcon,
} from '@mui/icons-material';
import { FormStepper } from '../shared/FormStepper';
import { BusinessBasicInfo } from './sections/BusinessBasicInfo';
import { OwnerInfo } from './sections/OwnerInfo';
import { BusinessIncomeExpenses } from './sections/BusinessIncomeExpenses';
import { BusinessAssets } from './sections/BusinessAssets';
import { BusinessReview } from './sections/BusinessReview';

export const BusinessTaxOrganizer = ({
  onSave,
  onBack,
  initialData = {},
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useVerticalStepper, setUseVerticalStepper] = useState(true);
  const [formData, setFormData] = useState({
    basicInfo: initialData.basicInfo || {},
    ownerInfo: initialData.ownerInfo || {},
    incomeExpenses: initialData.incomeExpenses || {},
    assets: initialData.assets || {},
    homeOffice: initialData.homeOffice || {},
  });

  // Auto-save functionality
  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem('businessTaxData', JSON.stringify(formData));
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
      id: 'basic-info',
      label: 'Business Information',
      description: 'Entity details, EIN, and owner information',
      content: (
        <BusinessBasicInfo
          data={formData.basicInfo}
          onChange={(data) => updateFormData('basicInfo', data)}
        />
      ),
      isCompleted: Boolean(formData.basicInfo.businessName && formData.basicInfo.ein),
      isRequired: true,
    },
    {
      id: 'owner-info',
      label: 'Owner Information',
      description: 'Details for all business owners',
      content: (
        <OwnerInfo
          data={formData.ownerInfo}
          onChange={(data) => updateFormData('ownerInfo', data)}
        />
      ),
      isCompleted: Boolean(formData.ownerInfo.owners && formData.ownerInfo.owners[0]?.firstName),
      isRequired: true,
    },
    {
      id: 'income-expenses',
      label: 'Income & Expenses',
      description: 'Business income, expenses, and cost of goods sold',
      content: (
        <BusinessIncomeExpenses
          data={formData.incomeExpenses}
          onChange={(data) => updateFormData('incomeExpenses', data)}
        />
      ),
      isCompleted: Boolean(formData.incomeExpenses.grossReceipts !== undefined),
      isRequired: true,
    },
    {
      id: 'home-office',
      label: 'Business Use of Home',
      description: 'Home office expenses and business use deductions',
      content: (
        <BusinessAssets
          data={formData.homeOffice}
          onChange={(data) => updateFormData('homeOffice', data)}
        />
      ),
      isCompleted: true, // Optional section
      isRequired: false,
    },
    {
      id: 'review',
      label: 'Review & Submit',
      description: 'Review your business information and submit',
      content: (
        <BusinessReview
          data={formData}
          onChange={setFormData}
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

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      onSave(formData);
    } finally {
      setIsSubmitting(false);
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
          <BusinessIcon sx={{ mr: 2, color: '#22c55e' }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: '#1e293b', fontWeight: 600 }}>
            Business Tax Organizer
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
            onClick={() => onSave(formData)}
            variant="outlined"
            size="small"
          >
            Save Progress
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
        <FormStepper
          steps={steps}
          activeStep={activeStep}
          onStepChange={setActiveStep}
          onNext={handleNext}
          onBack={handleBack}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel="Submit Business Tax Organizer"
          orientation={useVerticalStepper ? 'vertical' : 'horizontal'}
        />
      </Container>
    </Box>
  );
};