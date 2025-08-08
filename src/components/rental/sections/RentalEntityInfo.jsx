import React from 'react';
import {
  Typography,
  TextField,
  Grid,
  Checkbox,
  FormControlLabel,
  Box,
} from '@mui/material';
import { FormSection } from '../../shared/FormSection';

export const RentalEntityInfo = ({ data, onChange, onNext, onBack, isFirstStep }) => {
  const handleChange = (field, value) => {
    const newData = { ...data, [field]: value };
    onChange(newData);
  };

  const handlePropertyInNameChange = (checked) => {
    const newData = { 
      ...data, 
      propertyInName: checked,
      // Clear business fields if property is in personal name
      ...(checked ? {
        businessName: '',
        stateDateLLC: '',
        businessAddress: '',
        city: '',
        state: '',
        zip: '',
        county: '',
        ein: ''
      } : {})
    };
    onChange(newData);
  };

  return (
    <FormSection
      title="Entity Information"
      onNext={onNext}
      onBack={onBack}
      isFirstStep={isFirstStep}
    >
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          This section relates to the LLC holding property. Please list ownership information as applicable. 
          If it is owned by the Asset Management LLC simply indicate. Otherwise, list out ownership of LLC holding property. 
          Repeat this section for the number of LLCs you have in your blueprint.
        </Typography>
        
        <FormControlLabel
          control={
            <Checkbox
              checked={data.propertyInName || false}
              onChange={(e) => handlePropertyInNameChange(e.target.checked)}
            />
          }
          label="If your Rental Property is held in your name and not in a LLC check here"
        />
      </Box>

      {!data.propertyInName && (
        <>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Business Name"
                value={data.businessName || ''}
                onChange={(e) => handleChange('businessName', e.target.value)}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="State date of LLC"
                value={data.stateDateLLC || ''}
                onChange={(e) => handleChange('stateDateLLC', e.target.value)}
                variant="outlined"
                placeholder="MM/DD/YYYY"
              />
            </Grid>
          </Grid>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Business Address"
                value={data.businessAddress || ''}
                onChange={(e) => handleChange('businessAddress', e.target.value)}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="City"
                value={data.city || ''}
                onChange={(e) => handleChange('city', e.target.value)}
                variant="outlined"
              />
            </Grid>
          </Grid>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="State"
                value={data.state || ''}
                onChange={(e) => handleChange('state', e.target.value)}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Zip"
                value={data.zip || ''}
                onChange={(e) => handleChange('zip', e.target.value)}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="County"
                value={data.county || ''}
                onChange={(e) => handleChange('county', e.target.value)}
                variant="outlined"
              />
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Employer Identification Number"
                value={data.ein || ''}
                onChange={(e) => handleChange('ein', e.target.value)}
                variant="outlined"
                placeholder="XX-XXXXXXX"
              />
            </Grid>
          </Grid>
        </>
      )}
    </FormSection>
  );
};