import React from 'react';
import {
  Box,
  TextField,
  FormControlLabel,
  Switch,
  Typography,
  Paper,
  Chip,
} from '@mui/material';
import { FormSection } from '../../shared/FormSection';

export const IncomeInfo = ({ data, onChange }) => {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <FormSection title="W-2 Forms (Year End Wages)">
        <FormControlLabel
          control={
            <Switch
              checked={data.hasW2 || false}
              onChange={(e) => handleChange('hasW2', e.target.checked)}
            />
          }
          label="Did you receive W-2 forms?"
        />
        
        {data.hasW2 && (
          <TextField
            label="Number of W-2 Forms"
            type="number"
            value={data.w2Count || 1}
            onChange={(e) => handleChange('w2Count', parseInt(e.target.value))}
            inputProps={{ min: 1 }}
            fullWidth
            helperText="Please attach copies of all W-2 forms"
          />
        )}
      </FormSection>

      <FormSection title="1099 Forms">
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={data.has1099R || false}
                  onChange={(e) => handleChange('has1099R', e.target.checked)}
                />
              }
              label="1099-R (Retirement Distributions)"
            />
            {data.has1099R && (
              <TextField
                label="Number of 1099-R Forms"
                type="number"
                value={data.form1099RCount || 1}
                onChange={(e) => handleChange('form1099RCount', parseInt(e.target.value))}
                size="small"
                sx={{ mt: 1 }}
              />
            )}
          </Box>

          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={data.has1099Misc || false}
                  onChange={(e) => handleChange('has1099Misc', e.target.checked)}
                />
              }
              label="1099-MISC (Contract Work)"
            />
            {data.has1099Misc && (
              <TextField
                label="Number of 1099-MISC Forms"
                type="number"
                value={data.form1099MiscCount || 1}
                onChange={(e) => handleChange('form1099MiscCount', parseInt(e.target.value))}
                size="small"
                sx={{ mt: 1 }}
              />
            )}
          </Box>

          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={data.has1099Int || false}
                  onChange={(e) => handleChange('has1099Int', e.target.checked)}
                />
              }
              label="1099-INT (Interest Income)"
            />
            {data.has1099Int && (
              <TextField
                label="Number of 1099-INT Forms"
                type="number"
                value={data.form1099IntCount || 1}
                onChange={(e) => handleChange('form1099IntCount', parseInt(e.target.value))}
                size="small"
                sx={{ mt: 1 }}
              />
            )}
          </Box>

          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={data.has1099Div || false}
                  onChange={(e) => handleChange('has1099Div', e.target.checked)}
                />
              }
              label="1099-DIV (Dividend Income)"
            />
            {data.has1099Div && (
              <TextField
                label="Number of 1099-DIV Forms"
                type="number"
                value={data.form1099DivCount || 1}
                onChange={(e) => handleChange('form1099DivCount', parseInt(e.target.value))}
                size="small"
                sx={{ mt: 1 }}
              />
            )}
          </Box>

          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={data.has1099B || false}
                  onChange={(e) => handleChange('has1099B', e.target.checked)}
                />
              }
              label="1099-B (Stock Sales/Trading)"
            />
            {data.has1099B && (
              <TextField
                label="Number of 1099-B Forms"
                type="number"
                value={data.form1099BCount || 1}
                onChange={(e) => handleChange('form1099BCount', parseInt(e.target.value))}
                size="small"
                sx={{ mt: 1 }}
              />
            )}
          </Box>

          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={data.has1099G || false}
                  onChange={(e) => handleChange('has1099G', e.target.checked)}
                />
              }
              label="1099-G (Government Payments)"
            />
            {data.has1099G && (
              <TextField
                label="Number of 1099-G Forms"
                type="number"
                value={data.form1099GCount || 1}
                onChange={(e) => handleChange('form1099GCount', parseInt(e.target.value))}
                size="small"
                sx={{ mt: 1 }}
              />
            )}
          </Box>
        </Box>
      </FormSection>

      <FormSection title="Other Income">
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <TextField
            label="Alimony Received"
            type="number"
            value={data.alimonyReceived || ''}
            onChange={(e) => handleChange('alimonyReceived', e.target.value)}
            InputProps={{ startAdornment: '$' }}
            fullWidth
          />
          <TextField
            label="Jury Duty Pay"
            type="number"
            value={data.juryDutyPay || ''}
            onChange={(e) => handleChange('juryDutyPay', e.target.value)}
            InputProps={{ startAdornment: '$' }}
            fullWidth
          />
          <TextField
            label="Prizes, Bonuses, Awards"
            type="number"
            value={data.prizesAndAwards || ''}
            onChange={(e) => handleChange('prizesAndAwards', e.target.value)}
            InputProps={{ startAdornment: '$' }}
            fullWidth
          />
          <TextField
            label="Investment Interest"
            type="number"
            value={data.investmentInterest || ''}
            onChange={(e) => handleChange('investmentInterest', e.target.value)}
            InputProps={{ startAdornment: '$' }}
            fullWidth
          />
        </Box>

        <Box sx={{ mt: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={data.hasCrypto || false}
                onChange={(e) => handleChange('hasCrypto', e.target.checked)}
              />
            }
            label="Did you exchange, send, receive, or acquire any virtual or crypto currency?"
          />
        </Box>
      </FormSection>

      <Paper sx={{ p: 2, backgroundColor: '#f0f9ff', border: '1px solid #bae6fd' }}>
        <Typography variant="body2" color="primary">
          📄 <strong>Document Reminder:</strong> Please attach copies of all tax forms mentioned above
        </Typography>
      </Paper>
    </Box>
  );
};