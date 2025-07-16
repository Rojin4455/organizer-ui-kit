import React from 'react';
import { Box, TextField } from '@mui/material';
import { FormSection } from '../../shared/FormSection';

interface BusinessIncomeExpensesProps {
  data: any;
  onChange: (data: any) => void;
}

export const BusinessIncomeExpenses: React.FC<BusinessIncomeExpensesProps> = ({ data, onChange }) => {
  const handleChange = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <FormSection title="Business Income">
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <TextField
            label="Gross Receipts or Sales"
            type="number"
            value={data.grossReceipts || ''}
            onChange={(e) => handleChange('grossReceipts', e.target.value)}
            InputProps={{ startAdornment: '$' }}
            fullWidth
          />
          <TextField
            label="Other Income"
            type="number"
            value={data.otherIncome || ''}
            onChange={(e) => handleChange('otherIncome', e.target.value)}
            InputProps={{ startAdornment: '$' }}
            fullWidth
          />
        </Box>
      </FormSection>

      <FormSection title="Business Expenses">
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <TextField
            label="Advertising"
            type="number"
            value={data.advertising || ''}
            onChange={(e) => handleChange('advertising', e.target.value)}
            InputProps={{ startAdornment: '$' }}
            fullWidth
          />
          <TextField
            label="Office Expenses"
            type="number"
            value={data.officeExpenses || ''}
            onChange={(e) => handleChange('officeExpenses', e.target.value)}
            InputProps={{ startAdornment: '$' }}
            fullWidth
          />
          <TextField
            label="Professional Services"
            type="number"
            value={data.professionalServices || ''}
            onChange={(e) => handleChange('professionalServices', e.target.value)}
            InputProps={{ startAdornment: '$' }}
            fullWidth
          />
          <TextField
            label="Travel Expenses"
            type="number"
            value={data.travelExpenses || ''}
            onChange={(e) => handleChange('travelExpenses', e.target.value)}
            InputProps={{ startAdornment: '$' }}
            fullWidth
          />
        </Box>
      </FormSection>
    </Box>
  );
};