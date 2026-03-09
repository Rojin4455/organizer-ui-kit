import React from 'react';
import { Box, TextField, Typography } from '@mui/material';
import { FormSection } from '../../shared/FormSection';

export const FlipPurchaseInfo = ({ data, onChange }) => {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <FormSection title="Purchase Information">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="Purchase Cost (include HUD if possible)"
            value={data.purchaseCost ?? ''}
            onChange={(e) => handleChange('purchaseCost', e.target.value)}
            type="number"
            inputProps={{ min: 0, step: 0.01 }}
            fullWidth
            InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>$</Typography> }}
          />
          <TextField
            label="Date"
            value={data.purchaseDate ?? ''}
            onChange={(e) => handleChange('purchaseDate', e.target.value)}
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Other purchase costs"
            value={data.otherPurchaseCosts ?? ''}
            onChange={(e) => handleChange('otherPurchaseCosts', e.target.value)}
            type="number"
            inputProps={{ min: 0, step: 0.01 }}
            fullWidth
            InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>$</Typography> }}
          />
          <TextField
            label="Remodel/fix-up Costs"
            value={data.remodelFixUpCosts ?? ''}
            onChange={(e) => handleChange('remodelFixUpCosts', e.target.value)}
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
