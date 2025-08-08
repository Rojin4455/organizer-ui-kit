import React from 'react';
import {
  Box,
  TextField,
  FormControlLabel,
  Checkbox,
  Typography,
} from '@mui/material';
import { FormSection } from '../../shared/FormSection';

export const RentalEntityInfo = ({ data, onChange }) => {
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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <FormSection title="Entity Information" isSecure>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 2 }}>
                <TextField
                  label="Business Name"
                  value={data.businessName || ''}
                  onChange={(e) => handleChange('businessName', e.target.value)}
                  fullWidth
                />
                <TextField
                  label="State date of LLC"
                  value={data.stateDateLLC || ''}
                  onChange={(e) => handleChange('stateDateLLC', e.target.value)}
                  fullWidth
                  placeholder="MM/DD/YYYY"
                />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                <TextField
                  label="Business Address"
                  value={data.businessAddress || ''}
                  onChange={(e) => handleChange('businessAddress', e.target.value)}
                  fullWidth
                />
                <TextField
                  label="City"
                  value={data.city || ''}
                  onChange={(e) => handleChange('city', e.target.value)}
                  fullWidth
                />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
                <TextField
                  label="State"
                  value={data.state || ''}
                  onChange={(e) => handleChange('state', e.target.value)}
                  fullWidth
                />
                <TextField
                  label="Zip"
                  value={data.zip || ''}
                  onChange={(e) => handleChange('zip', e.target.value)}
                  fullWidth
                />
                <TextField
                  label="County"
                  value={data.county || ''}
                  onChange={(e) => handleChange('county', e.target.value)}
                  fullWidth
                />
              </Box>

              <TextField
                label="Employer Identification Number"
                value={data.ein || ''}
                onChange={(e) => handleChange('ein', e.target.value)}
                fullWidth
                placeholder="XX-XXXXXXX"
              />
            </>
          )}
        </Box>
      </FormSection>
    </Box>
  );
};