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
  Home as HomeIcon,
} from '@mui/icons-material';
import { ReadOnlyWrapper } from '../shared/ReadOnlyWrapper';
import { RentalEntityInfo } from './sections/RentalEntityInfo';
import { RentalOwnerInfo } from './sections/RentalOwnerInfo';
import { RentalPropertyInfo } from './sections/RentalPropertyInfo';
import { RentalIncomeExpenses } from './sections/RentalIncomeExpenses';

export const RentalPropertyOrganizerReadOnly = ({ 
  submissionData, 
  formInfo, 
  showHeader = true 
}) => {
  const formData = {
    entityInfo: submissionData?.entityInfo || {},
    ownerInfo: submissionData?.ownerInfo || {},
    propertyInfo: submissionData?.propertyInfo || {},
    incomeExpenses: submissionData?.incomeExpenses || {},
    notes: submissionData?.notes || {},
  };

  const sections = [
    {
      id: 'entity-info',
      title: 'Entity Information',
      description: 'Business and entity details',
      component: (
        <ReadOnlyWrapper readOnly={true}>
          <RentalEntityInfo data={formData.entityInfo} onChange={() => {}} />
        </ReadOnlyWrapper>
      ),
    },
    {
      id: 'owner-info',
      title: 'Owner Information',
      description: 'Property owner details',
      component: (
        <ReadOnlyWrapper readOnly={true}>
          <RentalOwnerInfo data={formData.ownerInfo} onChange={() => {}} />
        </ReadOnlyWrapper>
      ),
    },
    {
      id: 'property-info',
      title: 'Property Information',
      description: 'Rental property details',
      component: (
        <ReadOnlyWrapper readOnly={true}>
          <RentalPropertyInfo data={formData.propertyInfo} onChange={() => {}} />
        </ReadOnlyWrapper>
      ),
    },
    {
      id: 'income-expenses',
      title: 'Income & Expenses',
      description: 'Property income and expense details',
      component: (
        <ReadOnlyWrapper readOnly={true}>
          <RentalIncomeExpenses data={formData.incomeExpenses} onChange={() => {}} />
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
      case 'reviewed':
        return 'info';
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
                <HomeIcon sx={{ color: '#2563eb', fontSize: 40 }} />
              </Grid>
              <Grid item xs>
                <Typography variant="h4" sx={{ fontWeight: 600, mb: 1, color: '#1e293b' }}>
                  Rental Property Organizer
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Form ID: {formInfo?.id?.slice(0, 8) || 'N/A'}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Form Name: {formInfo?.form_name || 'N/A'}
                </Typography>
              </Grid>
              <Grid item>
                <Box sx={{ textAlign: 'right' }}>
                  <Chip
                    label={formInfo?.status || 'Unknown'}
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
        {sections.map((section) => (
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

        {formData.notes?.notes && (
          <Paper sx={{ mb: 4 }}>
            <Box sx={{ p: 3, backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#1e293b', mb: 1 }}>
                Notes
              </Typography>
            </Box>
            <Box sx={{ p: 3 }}>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {formData.notes.notes}
              </Typography>
            </Box>
          </Paper>
        )}

        {(submissionData?.signatures?.taxpayer || submissionData?.signatures?.partner) && (
          <Paper>
            <Box sx={{ p: 3, backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#1e293b', mb: 1 }}>
                Signatures
              </Typography>
            </Box>
            <Box sx={{ p: 3, display: 'flex', gap: 4 }}>
              {submissionData.signatures?.taxpayer && (
                <Box>
                  <Typography variant="subtitle2">Taxpayer</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Signed on: {submissionData.signatures.taxpayerDate || 'N/A'}
                  </Typography>
                </Box>
              )}
              {submissionData.signatures?.partner && (
                <Box>
                  <Typography variant="subtitle2">Partner</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Signed on: {submissionData.signatures.partnerDate || 'N/A'}
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        )}
      </Container>
    </Box>
  );
};
