import React from 'react';
import { Box, TextField } from '@mui/material';
import { FormSection } from '../../shared/FormSection';

export const FlipInfo = ({ data, onChange }) => {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <FormSection title="Flip Info" isSecure>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="Address of Property"
            value={data.address || ''}
            onChange={(e) => handleChange('address', e.target.value)}
            fullWidth
          />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2 }}>
            <TextField
              label="City"
              value={data.city || ''}
              onChange={(e) => handleChange('city', e.target.value)}
              fullWidth
            />
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
          </Box>
        </Box>
      </FormSection>
    </Box>
  );
};
