import React from 'react';
import {
  Box,
  Typography,
  Paper,
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
  // Map submission data to form data structure
  const formData = {
    entityInfo: submissionData?.entityInfo || {},
    ownerInfo: submissionData?.ownerInfo || {},
    propertyInfo: submissionData?.propertyInfo || {},
    incomeExpenses: submissionData?.incomeExpenses || {},
    notes: submissionData?.notes || {},
  };

  const sections = [
    {
      title: 'Entity Information',
      description: 'Business and entity details',
      component: RentalEntityInfo,
      dataKey: 'entityInfo',
    },
    {
      title: 'Owner Information',
      description: 'Property owner details',
      component: RentalOwnerInfo,
      dataKey: 'ownerInfo',
    },
    {
      title: 'Property Information',
      description: 'Rental property details',
      component: RentalPropertyInfo,
      dataKey: 'propertyInfo',
    },
    {
      title: 'Income & Expenses',
      description: 'Property income and expense details',
      component: RentalIncomeExpenses,
      dataKey: 'incomeExpenses',
    },
  ];

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'N/A';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
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
    <Box>
      {showHeader && (
        <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.50' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <HomeIcon sx={{ mr: 2, color: 'primary.main', fontSize: 32 }} />
            <Box>
              <Typography variant="h4" sx={{ color: 'primary.main' }}>
                Rental Property Organizer
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Form ID: {formInfo?.id?.slice(0, 8) || 'N/A'}
              </Typography>
            </Box>
            <Box sx={{ ml: 'auto' }}>
              <Chip
                label={formInfo?.status || 'Unknown'}
                color={getStatusColor(formInfo?.status)}
                variant="outlined"
                sx={{ mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                Submitted: {formatDate(formInfo?.submitted_at)}
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}

      {sections.map((section) => {
        const SectionComponent = section.component;
        return (
          <Paper key={section.dataKey} sx={{ mb: 3 }}>
            <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" sx={{ color: 'primary.main' }}>
                {section.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {section.description}
              </Typography>
            </Box>
            <Box sx={{ p: 3 }}>
              <ReadOnlyWrapper>
                <SectionComponent
                  data={formData[section.dataKey]}
                  formData={formData}
                  onChange={() => {}}
                  onNext={() => {}}
                  onBack={() => {}}
                  isFirstStep={false}
                />
              </ReadOnlyWrapper>
            </Box>
          </Paper>
        );
      })}

      {/* Notes Section */}
      {formData.notes?.notes && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
            Notes
          </Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {formData.notes.notes}
          </Typography>
        </Paper>
      )}

      {/* Signatures Section */}
      {(submissionData?.signatures?.taxpayer || submissionData?.signatures?.partner) && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
            Signatures
          </Typography>
          <Box sx={{ display: 'flex', gap: 4 }}>
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
    </Box>
  );
};