import React from 'react';
import { Box, TextField, FormControlLabel, Switch } from '@mui/material';
import { FormSection } from '../../shared/FormSection';

export const BusinessAssets = ({ data, onChange }) => {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <FormSection title="Business Assets">
        <FormControlLabel
          control={
            <Switch
              checked={data.hasAssets || false}
              onChange={(e) => handleChange('hasAssets', e.target.checked)}
            />
          }
          label="Did you acquire or dispose of any business assets?"
        />
        
        {data.hasAssets && (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mt: 2 }}>
            <TextField
              label="Equipment Purchased"
              type="number"
              value={data.equipmentPurchased || ''}
              onChange={(e) => handleChange('equipmentPurchased', e.target.value)}
              InputProps={{ startAdornment: '$' }}
              fullWidth
            />
            <TextField
              label="Vehicle Business Use %"
              type="number"
              value={data.vehicleBusinessUse || ''}
              onChange={(e) => handleChange('vehicleBusinessUse', e.target.value)}
              InputProps={{ endAdornment: '%' }}
              fullWidth
            />
          </Box>
        )}
      </FormSection>
    </Box>
  );
};