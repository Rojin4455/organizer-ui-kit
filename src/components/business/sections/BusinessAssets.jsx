import React from 'react';
import { Box, TextField, FormControlLabel, Switch, Typography, Divider, Paper } from '@mui/material';
import { FormSection } from '../../shared/FormSection';

export const BusinessAssets = ({ data, onChange }) => {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  const handleAssetChange = (index, field, value) => {
    const assets = [...(data.assets || [])];
    if (!assets[index]) {
      assets[index] = {};
    }
    assets[index][field] = value;
    handleChange('assets', assets);
  };

  const handleSignatureChange = (field, value) => {
    const signatures = { ...data.signatures };
    signatures[field] = value;
    handleChange('signatures', signatures);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <FormSection title="Assets and Depreciation">
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          List all business assets purchased during the year and existing assets being depreciated.
        </Typography>

        {/* Asset Entry Table */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Business Assets</Typography>
          {[0, 1, 2, 3, 4].map((index) => (
            <Box key={index} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr 1fr' }, gap: 2, mb: 2 }}>
              <TextField
                label={`Asset ${index + 1} - Description`}
                value={data.assets?.[index]?.description || ''}
                onChange={(e) => handleAssetChange(index, 'description', e.target.value)}
                placeholder="e.g., Office equipment, vehicle, furniture"
                fullWidth
              />
              <TextField
                label="Date Purchased"
                type="date"
                value={data.assets?.[index]?.datePurchased || ''}
                onChange={(e) => handleAssetChange(index, 'datePurchased', e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                label="Cost"
                type="number"
                value={data.assets?.[index]?.cost || ''}
                onChange={(e) => handleAssetChange(index, 'cost', e.target.value)}
                InputProps={{ startAdornment: '$' }}
                fullWidth
              />
              <TextField
                label="Business Use %"
                type="number"
                value={data.assets?.[index]?.businessUse || ''}
                onChange={(e) => handleAssetChange(index, 'businessUse', e.target.value)}
                InputProps={{ endAdornment: '%' }}
                fullWidth
              />
            </Box>
          ))}
        </Box>

        {/* Section 179 Deduction */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Section 179 Deduction</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <TextField
              label="Section 179 Deduction Amount"
              type="number"
              value={data.section179Amount || ''}
              onChange={(e) => handleChange('section179Amount', e.target.value)}
              InputProps={{ startAdornment: '$' }}
              fullWidth
            />
            <TextField
              label="Carryover from Prior Year"
              type="number"
              value={data.section179Carryover || ''}
              onChange={(e) => handleChange('section179Carryover', e.target.value)}
              InputProps={{ startAdornment: '$' }}
              fullWidth
            />
          </Box>
        </Box>

        {/* Depreciation Information */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Depreciation Information</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <TextField
              label="Prior Year Depreciation"
              type="number"
              value={data.priorDepreciation || ''}
              onChange={(e) => handleChange('priorDepreciation', e.target.value)}
              InputProps={{ startAdornment: '$' }}
              fullWidth
            />
            <TextField
              label="Current Year Depreciation"
              type="number"
              value={data.currentDepreciation || ''}
              onChange={(e) => handleChange('currentDepreciation', e.target.value)}
              InputProps={{ startAdornment: '$' }}
              fullWidth
            />
          </Box>
        </Box>

        {/* Listed Property */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Listed Property (Vehicles, Computers, etc.)</Typography>
          <FormControlLabel
            control={
              <Switch
                checked={data.hasListedProperty || false}
                onChange={(e) => handleChange('hasListedProperty', e.target.checked)}
              />
            }
            label="Check if you have listed property"
          />
          {data.hasListedProperty && (
            <Box sx={{ mt: 2 }}>
              <TextField
                label="Listed Property Details"
                multiline
                rows={3}
                value={data.listedPropertyDetails || ''}
                onChange={(e) => handleChange('listedPropertyDetails', e.target.value)}
                placeholder="Describe listed property, business use percentage, and depreciation method"
                fullWidth
              />
            </Box>
          )}
        </Box>
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