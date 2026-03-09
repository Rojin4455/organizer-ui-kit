import React from 'react';
import { Box, TextField, Typography } from '@mui/material';
import { FormSection } from '../../shared/FormSection';

export const FlipHoldingCosts = ({ data, onChange }) => {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <FormSection title="Holding Costs">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Taxes, utilities, interest, etc.
          </Typography>
          <TextField
            label="Holding Costs (taxes, utilities, interest, etc.)"
            value={data.holdingCosts ?? ''}
            onChange={(e) => handleChange('holdingCosts', e.target.value)}
            type="number"
            inputProps={{ min: 0, step: 0.01 }}
            fullWidth
            InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>$</Typography> }}
          />
        </Box>
      </FormSection>
    </Box>
  );
};
