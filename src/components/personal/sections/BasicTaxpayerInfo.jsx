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
  Checkbox,
  FormGroup,
} from '@mui/material';
import { SecureTextField } from '../../shared/SecureTextField';
import { FormSection } from '../../shared/FormSection';
import { TooltipWrapper } from '../../shared/TooltipWrapper';

export const BasicTaxpayerInfo = ({ data, onChange }) => {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <FormSection title="Basic Taxpayer Information" isSecure>
        <FormControlLabel
          control={
            <Checkbox
              checked={data.returningClient || false}
              onChange={(e) => handleChange('returningClient', e.target.checked)}
            />
          }
          label="Returning Client, No Changes to Personal Information"
          sx={{ mb: 2 }}
        />
      </FormSection>

      <FormSection title="Personal Information" isSecure>
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
            <TooltipWrapper content="If this is your initial year of marriage, you can file married filing jointly as long as you were wed before December 31.">
              <MenuItem value="marriedJointly">Married Filing Jointly</MenuItem>
            </TooltipWrapper>
            <TooltipWrapper content="Please make sure to fill out spouse's information as the IRS will require it.">
              <MenuItem value="marriedSeparately">Married Filing Separately</MenuItem>
            </TooltipWrapper>
            <MenuItem value="headOfHousehold">Head of Household</MenuItem>
            <MenuItem value="qualifyingWidow">Qualifying Widow(er)</MenuItem>
          </Select>
        </FormControl>
      </FormSection>

      <FormSection title="Contact Information">
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <TooltipWrapper content="Make sure this is the address where you can receive IRS correspondence.">
            <TextField
              label="Street Address"
              value={data.streetAddress || ''}
              onChange={(e) => handleChange('streetAddress', e.target.value)}
              fullWidth
              sx={{ gridColumn: { md: '1 / -1' } }}
            />
          </TooltipWrapper>
          <TextField
            label="City"
            value={data.city || ''}
            onChange={(e) => handleChange('city', e.target.value)}
            fullWidth
          />
          <TextField
            label="County"
            value={data.county || ''}
            onChange={(e) => handleChange('county', e.target.value)}
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
            sx={{ gridColumn: { md: '1 / -1' } }}
          />
          <TextField
            label="Home Phone"
            value={data.homePhone || ''}
            onChange={(e) => handleChange('homePhone', e.target.value)}
            fullWidth
          />
        </Box>
      </FormSection>

      <FormSection title="Additional Information">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Taxpayer Status */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
              Taxpayer
            </Typography>
            <FormGroup row>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={data.taxpayerBlind || false}
                    onChange={(e) => handleChange('taxpayerBlind', e.target.checked)}
                  />
                }
                label="Blind"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={data.taxpayerDisabled || false}
                    onChange={(e) => handleChange('taxpayerDisabled', e.target.checked)}
                  />
                }
                label="Disabled"
              />
            </FormGroup>
          </Box>

          {/* Spouse Status */}
          {data.hasSpouse && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                Spouse
              </Typography>
              <FormGroup row>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={data.spouseBlind || false}
                      onChange={(e) => handleChange('spouseBlind', e.target.checked)}
                    />
                  }
                  label="Blind"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={data.spouseDisabled || false}
                      onChange={(e) => handleChange('spouseDisabled', e.target.checked)}
                    />
                  }
                  label="Disabled"
                />
              </FormGroup>
            </Box>
          )}

          {/* Dependent Eligibility */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
              Eligible to be claimed as a dependent on another return:
            </Typography>
            <FormGroup row>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={data.taxpayerDependentEligible || false}
                    onChange={(e) => handleChange('taxpayerDependentEligible', e.target.checked)}
                  />
                }
                label="Taxpayer"
              />
              {data.hasSpouse && (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={data.spouseDependentEligible || false}
                      onChange={(e) => handleChange('spouseDependentEligible', e.target.checked)}
                    />
                  }
                  label="Spouse"
                />
              )}
            </FormGroup>
          </Box>

          {/* Date of Spouse's Death */}
          {data.filingStatus === 'qualifyingWidow' && (
            <TextField
              label="Date of Spouse's Death"
              type="date"
              value={data.spouseDeathDate || ''}
              onChange={(e) => handleChange('spouseDeathDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          )}

          {/* Marital Status Change */}
          <Box>
            <FormControlLabel
              control={
                <Checkbox
                  checked={data.maritalStatusChanged || false}
                  onChange={(e) => handleChange('maritalStatusChanged', e.target.checked)}
                />
              }
              label="Did your Marital Status change during the current tax year?"
            />
            
            {data.maritalStatusChanged && (
              <TextField
                label="If yes, please explain"
                value={data.maritalStatusExplanation || ''}
                onChange={(e) => handleChange('maritalStatusExplanation', e.target.value)}
                multiline
                rows={3}
                fullWidth
                sx={{ mt: 2 }}
              />
            )}
          </Box>
        </Box>
      </FormSection>
    </Box>
  );
};