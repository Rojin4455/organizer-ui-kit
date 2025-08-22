import React, { useState } from 'react';
import {
  Typography,
  Button,
  Box,
  Grid,
  Paper,
  TextField,
  Divider,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { SignatureDrawer } from '../../shared/SignatureDrawer';

export const RentalReview = ({ 
  data = {},
  formData = {},
  onChange, 
  onSave, 
  isSubmitting 
}) => {
  const [signatureOpen, setSignatureOpen] = useState(false);
  const [currentSignatureField, setCurrentSignatureField] = useState('');

  const handleNotesChange = (value) => {
    onChange({ ...data, notes: value });
  };

  console.log("reached hereeee: ")

  const handleSignatureClick = (field) => {
    setCurrentSignatureField(field);
    setSignatureOpen(true);
  };

  const handleSignatureSave = (signatureData) => {
    const signatures = data.signatures || {};
    const newData = {
      ...data,
      signatures: {
        ...signatures,
        [currentSignatureField]: signatureData,
        [`${currentSignatureField}Date`]: new Date().toLocaleDateString()
      }
    };
    onChange(newData);
    setSignatureOpen(false);
  };

  const handleSubmit = () => {
    onSave(true);
  };

  const renderFormSummary = () => {
    const summary = [];

    // Entity Information
    if (formData.entityInfo && Object.keys(formData.entityInfo).length > 0) {
      summary.push({
        title: 'Entity Information',
        completed: true,
        details: formData.entityInfo.propertyInName ? 
          'Property held in personal name' : 
          `Business: ${formData.entityInfo.businessName || 'Not provided'}`
      });
    }

    // Owner Information
    if (formData.ownerInfo?.owners?.length > 0) {
      summary.push({
        title: 'Owner Information',
        completed: true,
        details: `${formData.ownerInfo.owners.length} owner(s) added`
      });
    }

    // Property Information
    if (formData.propertyInfo && Object.keys(formData.propertyInfo).length > 0) {
      summary.push({
        title: 'Property Information',
        completed: true,
        details: formData.propertyInfo.propertyAddress || 'Property details provided'
      });
    }

    // Income & Expenses
    if (formData.incomeExpenses && Object.keys(formData.incomeExpenses).length > 0) {
      summary.push({
        title: 'Income & Expenses',
        completed: true,
        details: 'Income and expense information provided'
      });
    }

    return summary;
  };

  const formSummary = renderFormSummary();
  const completedSections = formSummary.filter(section => section.completed).length;
  const totalSections = 4; // Entity, Owner, Property, Income/Expenses

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Review & Submit
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Please review your rental property organizer information before submitting.
      </Typography>

      {/* Form Completion Status */}
      {/* <Paper sx={{ p: 3, mb: 3, bgcolor: completedSections === totalSections ? 'success.50' : 'warning.50' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Form Completion Status: {completedSections}/{totalSections} sections completed
        </Typography>
        
        <Grid container spacing={2}>
          {formSummary.map((section, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircleIcon 
                  sx={{ 
                    mr: 1, 
                    color: section.completed ? 'success.main' : 'grey.400' 
                  }} 
                />
                <Box>
                  <Typography variant="subtitle2">{section.title}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {section.details}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper> */}

      {/* Notes Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Notes
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Additional notes or comments"
          value={data.notes || ''}
          onChange={(e) => handleNotesChange(e.target.value)}
          variant="outlined"
          placeholder="Add any additional information, clarifications, or special circumstances..."
        />
      </Paper>

      {/* Signatures Section */}
      {/* <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 3 }}>
          Taxpayer and Partner Representation
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Taxpayer Signature
            </Typography>
            <Button
              variant={data.signatures?.taxpayer ? "contained" : "outlined"}
              onClick={() => handleSignatureClick('taxpayer')}
              sx={{ mb: 1, width: '100%' }}
            >
              {data.signatures?.taxpayer ? 'Update Signature' : 'Add Signature'}
            </Button>
            {data.signatures?.taxpayerDate && (
              <Typography variant="caption" color="text.secondary">
                Signed on: {data.signatures.taxpayerDate}
              </Typography>
            )}
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Partner Signature
            </Typography>
            <Button
              variant={data.signatures?.partner ? "contained" : "outlined"}
              onClick={() => handleSignatureClick('partner')}
              sx={{ mb: 1, width: '100%' }}
            >
              {data.signatures?.partner ? 'Update Signature' : 'Add Signature'}
            </Button>
            {data.signatures?.partnerDate && (
              <Typography variant="caption" color="text.secondary">
                Signed on: {data.signatures.partnerDate}
              </Typography>
            )}
          </Grid>
        </Grid>
      </Paper> */}

      <Divider sx={{ my: 3 }} />

      {/* Submit Button */}
      {/* <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<SendIcon />}
          onClick={handleSubmit}
          disabled={isSubmitting || completedSections < totalSections}
          sx={{ px: 6, py: 2 }}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Rental Property Organizer'}
        </Button>
      </Box> */}

      {/* {completedSections < totalSections && (
        <Typography variant="body2" color="error" align="center" sx={{ mt: 2 }}>
          Please complete all sections before submitting.
        </Typography>
      )}

      <SignatureDrawer
        open={signatureOpen}
        onClose={() => setSignatureOpen(false)}
        onSave={handleSignatureSave}
        title={`${currentSignatureField === 'taxpayer' ? 'Taxpayer' : 'Partner'} Signature`}
      /> */}
    </Box>
  );
};