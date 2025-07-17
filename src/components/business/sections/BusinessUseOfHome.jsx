import React from 'react';
import { Box, TextField, FormControlLabel, Switch, Typography } from '@mui/material';
import { FormSection } from '../../shared/FormSection';

export const BusinessUseOfHome = ({ data, onChange }) => {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  const handleOtherExpenseChange = (index, value) => {
    const otherExpenses = [...(data.otherExpenses || ['', '', '', ''])];
    otherExpenses[index] = value;
    handleChange('otherExpenses', otherExpenses);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <FormSection title="Business Use of Home">
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          A business must be profitable to take a business use of home deduction. Otherwise, any expense calculated will be suspended.
        </Typography>
        
        <FormControlLabel
          control={
            <Switch
              checked={data.hasHomeOffice || false}
              onChange={(e) => handleChange('hasHomeOffice', e.target.checked)}
            />
          }
          label="Check if you had a home office during the year."
        />
        
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
          *Note: home office must be used exclusively and regularly for the business.
        </Typography>
        
        {data.hasHomeOffice && (
          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2, mb: 2 }}>
              <TextField
                label="Rent"
                type="number"
                value={data.rent || ''}
                onChange={(e) => handleChange('rent', e.target.value)}
                InputProps={{ startAdornment: '$' }}
                fullWidth
              />
              <TextField
                label="Utilities"
                type="number"
                value={data.utilities || ''}
                onChange={(e) => handleChange('utilities', e.target.value)}
                InputProps={{ startAdornment: '$' }}
                fullWidth
              />
              <TextField
                label="Insurance"
                type="number"
                value={data.insurance || ''}
                onChange={(e) => handleChange('insurance', e.target.value)}
                InputProps={{ startAdornment: '$' }}
                fullWidth
              />
            </Box>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2, mb: 2 }}>
              <TextField
                label="Janitorial"
                type="number"
                value={data.janitorial || ''}
                onChange={(e) => handleChange('janitorial', e.target.value)}
                InputProps={{ startAdornment: '$' }}
                fullWidth
              />
              <TextField
                label="Miscellaneous"
                type="number"
                value={data.miscellaneous || ''}
                onChange={(e) => handleChange('miscellaneous', e.target.value)}
                InputProps={{ startAdornment: '$' }}
                fullWidth
              />
              <TextField
                label="% of Exclusive Business use"
                type="number"
                value={data.exclusiveBusinessUse || ''}
                onChange={(e) => handleChange('exclusiveBusinessUse', e.target.value)}
                InputProps={{ endAdornment: '%' }}
                fullWidth
              />
            </Box>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 2 }}>
              <TextField
                label="Size of Home"
                value={data.sizeOfHome || ''}
                onChange={(e) => handleChange('sizeOfHome', e.target.value)}
                placeholder="sq ft"
                fullWidth
              />
              <TextField
                label="Size of Home Office"
                value={data.sizeOfHomeOffice || ''}
                onChange={(e) => handleChange('sizeOfHomeOffice', e.target.value)}
                placeholder="sq ft"
                fullWidth
              />
            </Box>
            
            <TextField
              label="Repairs & Maintenance"
              type="number"
              value={data.repairsMaintenance || ''}
              onChange={(e) => handleChange('repairsMaintenance', e.target.value)}
              InputProps={{ startAdornment: '$' }}
              fullWidth
              sx={{ mb: 2 }}
            />
            
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Other Expenses (e.g., rent):
            </Typography>
            {[0, 1, 2, 3].map((index) => (
              <TextField
                key={index}
                value={(data.otherExpenses && data.otherExpenses[index]) || ''}
                onChange={(e) => handleOtherExpenseChange(index, e.target.value)}
                placeholder="Enter other expense description and amount"
                fullWidth
                sx={{ mb: 1 }}
              />
            ))}
          </Box>
        )}
      </FormSection>
    </Box>
  );
};