import React from 'react';
import {
  Typography,
  TextField,
  Grid,
  FormControlLabel,
  Checkbox,
  Box,
} from '@mui/material';
import { FormSection } from '../../shared/FormSection';

export const RentalPropertyInfo = ({ data, onChange, onNext, onBack }) => {
  const handleChange = (field, value) => {
    const newData = { ...data, [field]: value };
    onChange(newData);
  };

  const handlePropertyTypeChange = (type, checked) => {
    const propertyTypes = data.propertyTypes || {};
    const newData = {
      ...data,
      propertyTypes: {
        ...propertyTypes,
        [type]: checked
      }
    };
    onChange(newData);
  };

  const handleNewPropertyChange = (checked) => {
    const newData = { 
      ...data, 
      newPropertyPurchased: checked 
    };
    onChange(newData);
  };

  return (
    <FormSection
      title="Rental Property Information"
      onNext={onNext}
      onBack={onBack}
    >
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Enter the kind and location of property:
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Property Address"
            value={data.propertyAddress || ''}
            onChange={(e) => handleChange('propertyAddress', e.target.value)}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="City"
            value={data.city || ''}
            onChange={(e) => handleChange('city', e.target.value)}
            variant="outlined"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="State"
            value={data.state || ''}
            onChange={(e) => handleChange('state', e.target.value)}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="ZIP"
            value={data.zip || ''}
            onChange={(e) => handleChange('zip', e.target.value)}
            variant="outlined"
          />
        </Grid>
      </Grid>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>Property type:</Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} md={3}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={data.propertyTypes?.singleFamily || false}
                  onChange={(e) => handlePropertyTypeChange('singleFamily', e.target.checked)}
                />
              }
              label="Single family Res"
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={data.propertyTypes?.multiFamily || false}
                  onChange={(e) => handlePropertyTypeChange('multiFamily', e.target.checked)}
                />
              }
              label="Multi-Family Res"
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={data.propertyTypes?.commercial || false}
                  onChange={(e) => handlePropertyTypeChange('commercial', e.target.checked)}
                />
              }
              label="Commercial"
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={data.propertyTypes?.land || false}
                  onChange={(e) => handlePropertyTypeChange('land', e.target.checked)}
                />
              }
              label="Land"
            />
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Fair rental days"
            value={data.fairRentalDays || ''}
            onChange={(e) => handleChange('fairRentalDays', e.target.value)}
            variant="outlined"
            type="number"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Personal use days"
            value={data.personalUseDays || ''}
            onChange={(e) => handleChange('personalUseDays', e.target.value)}
            variant="outlined"
            type="number"
          />
        </Grid>
      </Grid>

      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Please include a list of assets (building, improvements, etc.) and other capitalized costs for each property. 
          The list should include the date purchased and amount for each item. Typically you can located this list in your 
          prior year tax return.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
          *For any new Properties please include a copy of HUDS or closing documents
        </Typography>
        
        <FormControlLabel
          control={
            <Checkbox
              checked={data.newPropertyPurchased || false}
              onChange={(e) => handleNewPropertyChange(e.target.checked)}
            />
          }
          label="Was any property purchased/converted to rental last year?"
        />
      </Box>
    </FormSection>
  );
};