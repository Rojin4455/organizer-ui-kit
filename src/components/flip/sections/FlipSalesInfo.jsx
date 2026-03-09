import React from 'react';
import { Box, TextField, Typography } from '@mui/material';
import { FormSection } from '../../shared/FormSection';

const toNum = (v) => (v === '' || v == null ? NaN : Number(String(v).replace(/[^0-9.-]/g, '')));
const formatCurrency = (n) => (Number.isFinite(n) ? `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '');

export const FlipSalesInfo = ({ data, onChange }) => {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  const salesPrice = toNum(data.salesPrice);
  const salesExpenses = toNum(data.salesExpenses);
  const calculatedProceeds = Number.isFinite(salesPrice) && Number.isFinite(salesExpenses)
    ? salesPrice - salesExpenses
    : null;
  const totalProceedsDisplay = data.totalProceeds !== undefined && data.totalProceeds !== ''
    ? formatCurrency(toNum(data.totalProceeds))
    : (calculatedProceeds != null ? formatCurrency(calculatedProceeds) : '');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <FormSection title="Sales Information">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Include HUD if possible.
          </Typography>
          <TextField
            label="Sales Price (Include HUD if possible)"
            value={data.salesPrice ?? ''}
            onChange={(e) => handleChange('salesPrice', e.target.value)}
            type="number"
            inputProps={{ min: 0, step: 0.01 }}
            fullWidth
            InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>$</Typography> }}
          />
          <TextField
            label="Date"
            value={data.salesDate ?? ''}
            onChange={(e) => handleChange('salesDate', e.target.value)}
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Sales Expenses"
            value={data.salesExpenses ?? ''}
            onChange={(e) => handleChange('salesExpenses', e.target.value)}
            type="number"
            inputProps={{ min: 0, step: 0.01 }}
            fullWidth
            InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>$</Typography> }}
          />
          <TextField
            label="Total Proceeds"
            value={data.totalProceeds ?? ''}
            onChange={(e) => handleChange('totalProceeds', e.target.value)}
            type="number"
            inputProps={{ min: 0, step: 0.01 }}
            fullWidth
            placeholder={calculatedProceeds != null ? calculatedProceeds.toString() : ''}
            helperText={calculatedProceeds != null && (data.totalProceeds === undefined || data.totalProceeds === '') ? `Calculated: ${formatCurrency(calculatedProceeds)}` : ''}
            InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>$</Typography> }}
          />
        </Box>
      </FormSection>
    </Box>
  );
};
