import React from 'react';
import {
  Box,
  TextField,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Typography,
} from '@mui/material';
import { FormSection } from '../../shared/FormSection';

export const RentalPropertyInfo = ({ data, onChange }) => {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  const handlePropertyTypeChange = (type, checked) => {
    const propertyTypes = data.propertyTypes || {};
    handleChange('propertyTypes', {
      ...propertyTypes,
      [type]: checked
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <FormSection title="Rental Property Information" isSecure>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Enter the kind and location of property:
          </Typography>

          <TextField
            label="Property Address"
            value={data.propertyAddress || ''}
            onChange={(e) => handleChange('propertyAddress', e.target.value)}
            required
            fullWidth
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
            <TextField
              label="City"
              value={data.city || ''}
              onChange={(e) => handleChange('city', e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="State"
              value={data.state || ''}
              onChange={(e) => handleChange('state', e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="ZIP"
              value={data.zip || ''}
              onChange={(e) => handleChange('zip', e.target.value)}
              required
              fullWidth
            />
          </Box>

          <Box>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>Property type:</Typography>
            <FormGroup row>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={data.propertyTypes?.singleFamily || false}
                    onChange={(e) => handlePropertyTypeChange('singleFamily', e.target.checked)}
                  />
                }
                label="Single family Res"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={data.propertyTypes?.multiFamily || false}
                    onChange={(e) => handlePropertyTypeChange('multiFamily', e.target.checked)}
                  />
                }
                label="Multi-Family Res"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={data.propertyTypes?.commercial || false}
                    onChange={(e) => handlePropertyTypeChange('commercial', e.target.checked)}
                  />
                }
                label="Commercial"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={data.propertyTypes?.land || false}
                    onChange={(e) => handlePropertyTypeChange('land', e.target.checked)}
                  />
                }
                label="Land"
              />
            </FormGroup>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <TextField
              label="Fair rental days"
              value={data.fairRentalDays || ''}
              onChange={(e) => handleChange('fairRentalDays', e.target.value)}
              type="number"
              fullWidth
            />
            <TextField
              label="Personal use days"
              value={data.personalUseDays || ''}
              onChange={(e) => handleChange('personalUseDays', e.target.value)}
              type="number"
              fullWidth
            />
          </Box>

          <FormControlLabel
            control={
              <Checkbox
                checked={data.newPropertyPurchased || false}
                onChange={(e) => handleChange('newPropertyPurchased', e.target.checked)}
              />
            }
            label="Was any property purchased/converted to rental last year?"
          />
        </Box>
      </FormSection>
    </Box>
  );
};