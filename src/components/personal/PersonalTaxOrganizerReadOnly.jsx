import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Divider,
  Chip,
} from '@mui/material';
import {
  Person as PersonIcon,
} from '@mui/icons-material';
import { BasicTaxpayerInfo } from './sections/BasicTaxpayerInfo';
import { DependentInfo } from './sections/DependentInfo';
import { IncomeInfo } from './sections/IncomeInfo';
import { DeductionsInfo } from './sections/DeductionsInfo';
import { TaxPaymentsInfo } from './sections/TaxPaymentsInfo';
import { GeneralQuestions } from './sections/GeneralQuestions';
import { ReadOnlyWrapper } from '../shared/ReadOnlyWrapper';

export const PersonalTaxOrganizerReadOnly = ({ 
  submissionData, 
  formInfo,
  showHeader = true 
}) => {
  // Structure the submission data to match the original form structure
  const formData = {
    basicInfo: submissionData?.basicInfo || {},
    dependents: submissionData?.dependents || [],
    income: submissionData?.income || {},
    deductions: submissionData?.deductions || {},
    taxPayments: submissionData?.taxPayments || {},
    generalQuestions: submissionData?.generalQuestions || {},
  };

  const sections = [
    {
      id: 'basic-info',
      title: 'Basic Information',
      description: 'Personal details, filing status, and contact information',
      component: (
        <ReadOnlyWrapper readOnly={true}>
          <BasicTaxpayerInfo
            data={formData.basicInfo}
            onChange={() => {}} // No-op for read-only
          />
        </ReadOnlyWrapper>
      ),
    },
    {
      id: 'dependents',
      title: 'Dependents',
      description: 'Information about dependents and child care expenses',
      component: (
        <ReadOnlyWrapper readOnly={true}>
          <DependentInfo
            data={formData.dependents}
            onChange={() => {}} // No-op for read-only
          />
        </ReadOnlyWrapper>
      ),
    },
    {
      id: 'general-questions',
      title: 'General Questions',
      description: 'Additional tax-related questions and situations',
      component: (
        <ReadOnlyWrapper readOnly={true}>
          <GeneralQuestions
            data={formData.generalQuestions}
            onChange={() => {}} // No-op for read-only
          />
        </ReadOnlyWrapper>
      ),
    },
    {
      id: 'income',
      title: 'Income',
      description: 'W-2s, 1099s, and other income sources',
      component: (
        <ReadOnlyWrapper readOnly={true}>
          <IncomeInfo
            data={formData.income}
            onChange={() => {}} // No-op for read-only
          />
        </ReadOnlyWrapper>
      ),
    },
    {
      id: 'deductions',
      title: 'Deductions',
      description: 'Medical expenses, charitable contributions, and other deductions',
      component: (
        <ReadOnlyWrapper readOnly={true}>
          <DeductionsInfo
            data={formData.deductions}
            onChange={() => {}} // No-op for read-only
          />
        </ReadOnlyWrapper>
      ),
    },
    {
      id: 'tax-payments',
      title: 'Tax Payments',
      description: 'Estimated tax payments and withholdings',
      component: (
        <ReadOnlyWrapper readOnly={true}>
          <TaxPaymentsInfo
            data={formData.taxPayments}
            onChange={() => {}} // No-op for read-only
          />
        </ReadOnlyWrapper>
      ),
    },
  ];

  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'submitted':
        return 'success';
      case 'drafted':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {showHeader && (
        <>
          <Paper sx={{ p: 3, mb: 3, backgroundColor: '#f8fafc' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <PersonIcon sx={{ color: '#3b82f6', fontSize: 40 }} />
              </Grid>
              <Grid item xs>
                <Typography variant="h4" sx={{ fontWeight: 600, mb: 1, color: '#1e293b' }}>
                  Personal Tax Organizer
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Form ID: {formInfo?.id}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Form Name: {formInfo?.form_name || 'N/A'}
                </Typography>
              </Grid>
              <Grid item>
                <Box sx={{ textAlign: 'right' }}>
                  <Chip
                    label={formInfo?.status?.charAt(0).toUpperCase() + formInfo?.status?.slice(1)}
                    color={getStatusColor(formInfo?.status)}
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Submitted: {formatDate(formInfo?.submitted_at)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
          <Divider sx={{ mb: 4 }} />
        </>
      )}

      <Container maxWidth="lg" sx={{ mb: 4 }}>
        {sections.map((section, index) => (
          <Paper key={section.id} sx={{ mb: 4, overflow: 'hidden' }}>
            <Box sx={{ p: 3, backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#1e293b', mb: 1 }}>
                {section.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {section.description}
              </Typography>
            </Box>
            <Box sx={{ p: 3 }}>
              {section.component}
            </Box>
          </Paper>
        ))}
      </Container>
    </Box>
  );
};