import React, { useState, useEffect } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Paper,
  Grid,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { FormStepper } from '../shared/FormStepper';
import { BasicTaxpayerInfo } from './sections/BasicTaxpayerInfo';
import { DependentInfo } from './sections/DependentInfo';
import { IncomeInfo } from './sections/IncomeInfo';
import { DeductionsInfo } from './sections/DeductionsInfo';
import { TaxPaymentsInfo } from './sections/TaxPaymentsInfo';
import { ReviewSubmit } from './sections/ReviewSubmit';

export const PersonalTaxOrganizer = ({
  onSave,
  onBack,
  initialData = {},
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useVerticalStepper, setUseVerticalStepper] = useState(true);
  const [formData, setFormData] = useState({
    basicInfo: initialData.basicInfo || {},
    dependents: initialData.dependents || [],
    income: initialData.income || {},
    deductions: initialData.deductions || {},
    taxPayments: initialData.taxPayments || {},
  });

  // Auto-save functionality
  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem('personalTaxData', JSON.stringify(formData));
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
      label: 'Basic Information',
      description: 'Personal details, filing status, and contact information',
      content: (
        <BasicTaxpayerInfo
          data={formData.basicInfo}
          onChange={(data) => updateFormData('basicInfo', data)}
        />
      ),
      isCompleted: Boolean(formData.basicInfo.firstName && formData.basicInfo.lastName && formData.basicInfo.ssn),
      isRequired: true,
    },
    {
      id: 'dependents',
      label: 'Dependents',
      description: 'Information about dependents and child care expenses',
      content: (
        <DependentInfo
          data={formData.dependents}
          onChange={(data) => updateFormData('dependents', data)}
        />
      ),
      isCompleted: true, // Optional section
      isRequired: false,
    },
    {
      id: 'income',
      label: 'Income',
      description: 'W-2s, 1099s, and other income sources',
      content: (
        <IncomeInfo
          data={formData.income}
          onChange={(data) => updateFormData('income', data)}
        />
      ),
      isCompleted: Boolean(formData.income.hasW2 !== undefined),
      isRequired: true,
    },
    {
      id: 'deductions',
      label: 'Deductions',
      description: 'Medical expenses, charitable contributions, and other deductions',
      content: (
        <DeductionsInfo
          data={formData.deductions}
          onChange={(data) => updateFormData('deductions', data)}
        />
      ),
      isCompleted: true, // Optional section
      isRequired: false,
    },
    {
      id: 'tax-payments',
      label: 'Tax Payments',
      description: 'Estimated tax payments and withholdings',
      content: (
        <TaxPaymentsInfo
          data={formData.taxPayments}
          onChange={(data) => updateFormData('taxPayments', data)}
        />
      ),
      isCompleted: true, // Optional section
      isRequired: false,
    },
    {
      id: 'review',
      label: 'Review & Submit',
      description: 'Review your information and submit',
      content: (
        <ReviewSubmit
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
          <PersonIcon sx={{ mr: 2, color: '#3b82f6' }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: '#1e293b', fontWeight: 600 }}>
            Personal Tax Organizer
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
          submitLabel="Submit Tax Organizer"
          orientation={useVerticalStepper ? 'vertical' : 'horizontal'}
        />
      </Container>
    </Box>
  );
};