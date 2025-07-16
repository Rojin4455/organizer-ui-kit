import React from 'react';
import {
  Box,
  TextField,
  Typography,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { SecureTextField } from '../../shared/SecureTextField';
import { FormSection } from '../../shared/FormSection';

export const TaxPaymentsInfo = ({ data, onChange }) => {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <FormSection title="Estimated Tax Payments">
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Enter any estimated tax payments you made directly to the IRS (not including withholdings from paychecks).
        </Typography>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <TextField
            label="Q1 Payment (Due 4/15)"
            type="number"
            value={data.q1Payment || ''}
            onChange={(e) => handleChange('q1Payment', e.target.value)}
            InputProps={{ startAdornment: '$' }}
            fullWidth
          />
          <TextField
            label="Q2 Payment (Due 6/15)"
            type="number"
            value={data.q2Payment || ''}
            onChange={(e) => handleChange('q2Payment', e.target.value)}
            InputProps={{ startAdornment: '$' }}
            fullWidth
          />
          <TextField
            label="Q3 Payment (Due 9/15)"
            type="number"
            value={data.q3Payment || ''}
            onChange={(e) => handleChange('q3Payment', e.target.value)}
            InputProps={{ startAdornment: '$' }}
            fullWidth
          />
          <TextField
            label="Q4 Payment (Due 1/15)"
            type="number"
            value={data.q4Payment || ''}
            onChange={(e) => handleChange('q4Payment', e.target.value)}
            InputProps={{ startAdornment: '$' }}
            fullWidth
          />
        </Box>
      </FormSection>

      <FormSection title="Direct Deposit Information" isSecure>
        <FormControlLabel
          control={
            <Switch
              checked={data.wantsDirectDeposit || false}
              onChange={(e) => handleChange('wantsDirectDeposit', e.target.checked)}
            />
          }
          label="Would you like your refund direct deposited?"
        />

        {data.wantsDirectDeposit && (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mt: 2 }}>
            <TextField
              label="Financial Institution Name"
              value={data.bankName || ''}
              onChange={(e) => handleChange('bankName', e.target.value)}
              fullWidth
            />
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Account Type
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={data.accountType === 'checking'}
                      onChange={(e) => handleChange('accountType', e.target.checked ? 'checking' : 'savings')}
                    />
                  }
                  label="Checking"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={data.accountType === 'savings'}
                      onChange={(e) => handleChange('accountType', e.target.checked ? 'savings' : 'checking')}
                    />
                  }
                  label="Savings"
                />
              </Box>
            </Box>
            <SecureTextField
              label="Routing Transit Number"
              value={data.routingNumber || ''}
              onChange={(value) => handleChange('routingNumber', value)}
              type="routing"
              helperText="Must begin with 01-12 or 21-32"
            />
            <SecureTextField
              label="Account Number"
              value={data.accountNumber || ''}
              onChange={(value) => handleChange('accountNumber', value)}
              type="account"
            />
          </Box>
        )}
      </FormSection>

      <FormSection title="Electronic Filing">
        <FormControlLabel
          control={
            <Switch
              checked={data.wantsElectronicFiling !== false}
              onChange={(e) => handleChange('wantsElectronicFiling', e.target.checked)}
            />
          }
          label="Would you like to file electronically?"
        />
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Electronic filing is faster, more secure, and provides quicker processing of your return.
        </Typography>
      </FormSection>

      <FormSection title="Prior Year Information">
        <FormControlLabel
          control={
            <Switch
              checked={data.hadPriorYearChanges || false}
              onChange={(e) => handleChange('hadPriorYearChanges', e.target.checked)}
            />
          }
          label="Were you notified by the IRS of changes to a prior year's return?"
        />

        <FormControlLabel
          control={
            <Switch
              checked={data.needsAmendedReturn || false}
              onChange={(e) => handleChange('needsAmendedReturn', e.target.checked)}
            />
          }
          label="Do you need to file an amended return for a prior year?"
        />

        <TextField
          label="Prior Year Overpayment Applied"
          type="number"
          value={data.priorYearOverpayment || ''}
          onChange={(e) => handleChange('priorYearOverpayment', e.target.value)}
          InputProps={{ startAdornment: '$' }}
          fullWidth
          helperText="Amount from prior year applied to current year"
        />
      </FormSection>
    </Box>
  );
};