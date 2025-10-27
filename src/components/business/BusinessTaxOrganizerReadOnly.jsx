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
  Business as BusinessIcon,
} from '@mui/icons-material';
import { BusinessBasicInfo } from './sections/BusinessBasicInfo';
import { OwnerInfo } from './sections/OwnerInfo';
import { BusinessIncomeExpenses } from './sections/BusinessIncomeExpenses';
import { BusinessAssets } from './sections/BusinessAssets';
import { ReadOnlyWrapper } from '../shared/ReadOnlyWrapper';

export const BusinessTaxOrganizerReadOnly = ({ 
  submissionData, 
  formInfo,
  showHeader = true 
}) => {
  // Structure the submission data to match the original form structure
  const formData = {
    basicInfo: submissionData?.basicInfo || {},
    ownerInfo: submissionData?.ownerInfo || {},
    incomeExpenses: submissionData?.incomeExpenses || {},
    assets: submissionData?.assets || {},
    homeOffice: submissionData?.homeOffice || {},
  };

  const sections = [
    {
      id: 'basic-info',
      title: 'Business Information',
      description: 'Entity details, EIN, and business information',
      component: (
        <ReadOnlyWrapper readOnly={true}>
          <BusinessBasicInfo
            data={formData.basicInfo}
            onChange={() => {}} // No-op for read-only
          />
        </ReadOnlyWrapper>
      ),
    },
    {
      id: 'owner-info',
      title: 'Owner Information',
      description: 'Details for all business owners',
      component: (
        <ReadOnlyWrapper readOnly={true}>
          <OwnerInfo
            data={formData.ownerInfo}
            onChange={() => {}} // No-op for read-only
          />
        </ReadOnlyWrapper>
      ),
    },
    {
      id: 'income-expenses',
      title: 'Income & Expenses',
      description: 'Business income, expenses, and cost of goods sold',
      component: (
        <ReadOnlyWrapper readOnly={true}>
          <BusinessIncomeExpenses
            data={formData.incomeExpenses}
            onChange={() => {}} // No-op for read-only
          />
        </ReadOnlyWrapper>
      ),
    },
    {
      id: 'home-office',
      title: 'Business Use of Home',
      description: 'Home office expenses and business use deductions',
      component: (
        <ReadOnlyWrapper readOnly={true}>
          <BusinessAssets
            data={formData.homeOffice}
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
                <BusinessIcon sx={{ color: '#22c55e', fontSize: 40 }} />
              </Grid>
              <Grid item xs>
                <Typography variant="h4" sx={{ fontWeight: 600, mb: 1, color: '#1e293b' }}>
                  Business Tax Organizer
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