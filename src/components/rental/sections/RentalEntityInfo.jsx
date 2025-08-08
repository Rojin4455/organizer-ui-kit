import React from 'react';
import {
  Box,
  TextField,
  FormControlLabel,
  Checkbox,
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
        llcFormationDate: '',
        businessAddress: '',
        businessCity: '',
        businessState: '',
        businessZip: '',
        businessCounty: '',
        ein: ''
      } : {})
    };
    onChange(newData);
  };

  return (
    <FormSection
      title="Entity Information"
      description="Provide information about the entity holding the rental property"
    >
      <Box sx={{ display: 'grid', gap: 3 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={data.propertyInName || false}
              onChange={(e) => handlePropertyInNameChange(e.target.checked)}
            />
          }
          label="Property is held in my name (not in an LLC or business entity)"
        />

        {!data.propertyInName && (
          <>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <TextField
                label="Business/LLC Name"
                value={data.businessName || ''}
                onChange={(e) => handleChange('businessName', e.target.value)}
                fullWidth
              />
              <TextField
                label="LLC Formation Date"
                type="date"
                value={data.llcFormationDate || ''}
                onChange={(e) => handleChange('llcFormationDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Box>

            <TextField
              label="Business Address"
              value={data.businessAddress || ''}
              onChange={(e) => handleChange('businessAddress', e.target.value)}
              fullWidth
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr' }, gap: 2 }}>
              <TextField
                label="City"
                value={data.businessCity || ''}
                onChange={(e) => handleChange('businessCity', e.target.value)}
                fullWidth
              />
              <TextField
                label="State"
                value={data.businessState || ''}
                onChange={(e) => handleChange('businessState', e.target.value)}
                fullWidth
              />
              <TextField
                label="ZIP Code"
                value={data.businessZip || ''}
                onChange={(e) => handleChange('businessZip', e.target.value)}
                fullWidth
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <TextField
                label="County"
                value={data.businessCounty || ''}
                onChange={(e) => handleChange('businessCounty', e.target.value)}
                fullWidth
              />
              <TextField
                label="EIN (Federal Tax ID)"
                value={data.ein || ''}
                onChange={(e) => handleChange('ein', e.target.value)}
                fullWidth
              />
            </Box>
          </>
        )}
      </Box>
    </FormSection>
  );
};