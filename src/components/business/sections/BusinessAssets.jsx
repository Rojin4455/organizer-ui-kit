import React from 'react';
import { Box, TextField, FormControlLabel, Switch, Typography, Divider, Paper } from '@mui/material';
import { FormSection } from '../../shared/FormSection';

export const BusinessAssets = ({ data, onChange }) => {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  const handleOtherExpenseChange = (index, value) => {
    const otherExpenses = [...(data.otherExpenses || ['', '', '', ''])];
    otherExpenses[index] = value;
    handleChange('otherExpenses', otherExpenses);
  };

  const handleSignatureChange = (field, value) => {
    const signatures = { ...data.signatures };
    signatures[field] = value;
    handleChange('signatures', signatures);
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

      {/* Taxpayer and Partner Representation */}
      <Paper elevation={1} sx={{ p: 3, mt: 4, backgroundColor: '#f8f9fa' }}>
        <Typography variant="h6" sx={{ mb: 2, textAlign: 'center', fontWeight: 'bold' }}>
          TAXPAYER AND PARTNER (IF REQUIRED) REPRESENTATION
        </Typography>
        
        <Typography variant="body2" sx={{ mb: 3 }}>
          To the best of my knowledge the information enclosed in this client tax organizer is correct and includes all income, 
          deductions and other information necessary for the preparation of this year's income tax returns for which 
          I have adequate records.
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
          <TextField
            label="Taxpayer Signature"
            value={data.signatures?.taxpayerSignature || ''}
            onChange={(e) => handleSignatureChange('taxpayerSignature', e.target.value)}
            fullWidth
          />
          <TextField
            label="Date"
            type="date"
            value={data.signatures?.taxpayerDate || ''}
            onChange={(e) => handleSignatureChange('taxpayerDate', e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          <TextField
            label="Partner Signature"
            value={data.signatures?.partnerSignature || ''}
            onChange={(e) => handleSignatureChange('partnerSignature', e.target.value)}
            fullWidth
          />
          <TextField
            label="Date"
            type="date"
            value={data.signatures?.partnerDate || ''}
            onChange={(e) => handleSignatureChange('partnerDate', e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </Box>
      </Paper>

      {/* Notes Section */}
      <Paper elevation={1} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          NOTES:
        </Typography>
        <TextField
          multiline
          rows={6}
          value={data.notes || ''}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Add any additional notes, comments, or information relevant to your business tax return..."
          fullWidth
          variant="outlined"
        />
      </Paper>
    </Box>
  );
};