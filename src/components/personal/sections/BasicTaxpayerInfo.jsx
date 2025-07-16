import React from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Typography,
  Divider,
} from '@mui/material';
import { SecureTextField } from '../../shared/SecureTextField';
import { FormSection } from '../../shared/FormSection';

export const BasicTaxpayerInfo = ({ data, onChange }) => {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <FormSection title="Taxpayer Information" isSecure>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <TextField
            label="First Name"
            value={data.firstName || ''}
            onChange={(e) => handleChange('firstName', e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Last Name"
            value={data.lastName || ''}
            onChange={(e) => handleChange('lastName', e.target.value)}
            required
            fullWidth
          />
          <SecureTextField
            label="Social Security Number"
            value={data.ssn || ''}
            onChange={(value) => handleChange('ssn', value)}
            type="ssn"
            required
          />
          <TextField
            label="Date of Birth"
            type="date"
            value={data.dateOfBirth || ''}
            onChange={(e) => handleChange('dateOfBirth', e.target.value)}
            InputLabelProps={{ shrink: true }}
            required
            fullWidth
          />
          <TextField
            label="Occupation"
            value={data.occupation || ''}
            onChange={(e) => handleChange('occupation', e.target.value)}
            fullWidth
          />
          <TextField
            label="Cell Phone"
            value={data.cellPhone || ''}
            onChange={(e) => handleChange('cellPhone', e.target.value)}
            fullWidth
          />
        </Box>
      </FormSection>

      <FormSection title="Spouse Information" isSecure>
        <FormControlLabel
          control={
            <Switch
              checked={data.hasSpouse || false}
              onChange={(e) => handleChange('hasSpouse', e.target.checked)}
            />
          }
          label="Married/Have spouse"
        />
        
        {data.hasSpouse && (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mt: 2 }}>
            <TextField
              label="Spouse First Name"
              value={data.spouseFirstName || ''}
              onChange={(e) => handleChange('spouseFirstName', e.target.value)}
              fullWidth
            />
            <TextField
              label="Spouse Last Name"
              value={data.spouseLastName || ''}
              onChange={(e) => handleChange('spouseLastName', e.target.value)}
              fullWidth
            />
            <SecureTextField
              label="Spouse SSN"
              value={data.spouseSSN || ''}
              onChange={(value) => handleChange('spouseSSN', value)}
              type="ssn"
            />
            <TextField
              label="Spouse Date of Birth"
              type="date"
              value={data.spouseDateOfBirth || ''}
              onChange={(e) => handleChange('spouseDateOfBirth', e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="Spouse Occupation"
              value={data.spouseOccupation || ''}
              onChange={(e) => handleChange('spouseOccupation', e.target.value)}
              fullWidth
            />
            <TextField
              label="Spouse Cell Phone"
              value={data.spouseCellPhone || ''}
              onChange={(e) => handleChange('spouseCellPhone', e.target.value)}
              fullWidth
            />
          </Box>
        )}
      </FormSection>

      <FormSection title="Filing Status">
        <FormControl fullWidth>
          <InputLabel>Filing Status</InputLabel>
          <Select
            value={data.filingStatus || ''}
            onChange={(e) => handleChange('filingStatus', e.target.value)}
            label="Filing Status"
          >
            <MenuItem value="single">Single</MenuItem>
            <MenuItem value="marriedJointly">Married Filing Jointly</MenuItem>
            <MenuItem value="marriedSeparately">Married Filing Separately</MenuItem>
            <MenuItem value="headOfHousehold">Head of Household</MenuItem>
            <MenuItem value="qualifyingWidow">Qualifying Widow(er)</MenuItem>
          </Select>
        </FormControl>
      </FormSection>

      <FormSection title="Contact Information">
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <TextField
            label="Street Address"
            value={data.streetAddress || ''}
            onChange={(e) => handleChange('streetAddress', e.target.value)}
            fullWidth
          />
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
            label="ZIP Code"
            value={data.zipCode || ''}
            onChange={(e) => handleChange('zipCode', e.target.value)}
            fullWidth
          />
          <TextField
            label="Email Address"
            type="email"
            value={data.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            fullWidth
          />
          <TextField
            label="Home Phone"
            value={data.homePhone || ''}
            onChange={(e) => handleChange('homePhone', e.target.value)}
            fullWidth
          />
        </Box>
      </FormSection>
    </Box>
  );
};