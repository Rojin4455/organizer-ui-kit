import React from 'react';
import {
  Box,
  TextField,
  FormControlLabel,
  Switch,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { FormSection } from '../../shared/FormSection';

export const IncomeInfo = ({ data, onChange }) => {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <FormSection title="Standard Forms">
        <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
          Listed below are standard forms that some taxpayers receive during the course of the year. 
          Please make sure to check the appropriate box, send us a copy of the form, and list the 
          appropriate quantity of that particular form.
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          {/* Left Column */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* W-2 */}
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={data.hasW2 || false}
                    onChange={(e) => handleChange('hasW2', e.target.checked)}
                  />
                }
                label="W-2 (Year End Wages statement from Employer)"
              />
              {data.hasW2 && (
                <TextField
                  label="If Yes, how many?"
                  type="number"
                  value={data.w2Count || ''}
                  onChange={(e) => handleChange('w2Count', e.target.value)}
                  size="small"
                  sx={{ mt: 1, ml: 3 }}
                />
              )}
            </Box>

            {/* 1099-R */}
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={data.has1099R || false}
                    onChange={(e) => handleChange('has1099R', e.target.checked)}
                  />
                }
                label="1099 R (Distribution from Pension, Annuities, Retirement, or Profit sharing)"
              />
              {data.has1099R && (
                <Box sx={{ ml: 3, mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <TextField
                    label="If Yes, how many?"
                    type="number"
                    value={data.form1099RCount || ''}
                    onChange={(e) => handleChange('form1099RCount', e.target.value)}
                    size="small"
                  />
                  <TextField
                    label="If it was a rollover please explain"
                    multiline
                    rows={2}
                    value={data.rolloverExplanation || ''}
                    onChange={(e) => handleChange('rolloverExplanation', e.target.value)}
                    size="small"
                  />
                  <TextField
                    label="If partial rollover please explain"
                    multiline
                    rows={2}
                    value={data.partialRolloverExplanation || ''}
                    onChange={(e) => handleChange('partialRolloverExplanation', e.target.value)}
                    size="small"
                  />
                </Box>
              )}
            </Box>

            {/* 1098 (Home Mortgage Interest) */}
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={data.has1098 || false}
                    onChange={(e) => handleChange('has1098', e.target.checked)}
                  />
                }
                label="1098- (Home Mortgage Interest)"
              />
              {data.has1098 && (
                <Box sx={{ ml: 3, mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <TextField
                    label="If Yes, how many?"
                    type="number"
                    value={data.form1098Count || ''}
                    onChange={(e) => handleChange('form1098Count', e.target.value)}
                    size="small"
                  />
                  <TextField
                    label="If any of the 1098 or rentals please list them"
                    multiline
                    rows={2}
                    value={data.mortgageRentalList || ''}
                    onChange={(e) => handleChange('mortgageRentalList', e.target.value)}
                    size="small"
                  />
                </Box>
              )}
            </Box>

            {/* 1098-T */}
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={data.has1098T || false}
                    onChange={(e) => handleChange('has1098T', e.target.checked)}
                  />
                }
                label="1098 T (Education and Tuition Fees)"
              />
              {data.has1098T && (
                <Box sx={{ ml: 3, mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <TextField
                    label="If Yes, how many?"
                    type="number"
                    value={data.form1098TCount || ''}
                    onChange={(e) => handleChange('form1098TCount', e.target.value)}
                    size="small"
                  />
                  <TextField
                    label="List the name of the financial institution"
                    value={data.educationInstitution || ''}
                    onChange={(e) => handleChange('educationInstitution', e.target.value)}
                    size="small"
                  />
                </Box>
              )}
            </Box>

            {/* 1098 (Student loan interest) */}
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={data.has1098StudentLoan || false}
                    onChange={(e) => handleChange('has1098StudentLoan', e.target.checked)}
                  />
                }
                label="1098 (Student loan interest)"
              />
              {data.has1098StudentLoan && (
                <TextField
                  label="If Yes, how many?"
                  type="number"
                  value={data.form1098StudentLoanCount || ''}
                  onChange={(e) => handleChange('form1098StudentLoanCount', e.target.value)}
                  size="small"
                  sx={{ mt: 1, ml: 3 }}
                />
              )}
            </Box>
          </Box>

          {/* Right Column */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* 1099 Misc */}
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={data.has1099Misc || false}
                    onChange={(e) => handleChange('has1099Misc', e.target.checked)}
                  />
                }
                label="1099 Misc (Income from contracted work)"
              />
              {data.has1099Misc && (
                <TextField
                  label="If Yes, how many?"
                  type="number"
                  value={data.form1099MiscCount || ''}
                  onChange={(e) => handleChange('form1099MiscCount', e.target.value)}
                  size="small"
                  sx={{ mt: 1, ml: 3 }}
                />
              )}
            </Box>

            {/* W-2 G */}
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={data.hasW2G || false}
                    onChange={(e) => handleChange('hasW2G', e.target.checked)}
                  />
                }
                label="W-2 G (Winnings from Gambling, you must possess the form)"
              />
              {data.hasW2G && (
                <TextField
                  label="If Yes, how many?"
                  type="number"
                  value={data.w2GCount || ''}
                  onChange={(e) => handleChange('w2GCount', e.target.value)}
                  size="small"
                  sx={{ mt: 1, ml: 3 }}
                />
              )}
            </Box>

            {/* SSA/RRB Forms */}
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={data.hasSSA || false}
                    onChange={(e) => handleChange('hasSSA', e.target.checked)}
                  />
                }
                label="SSA Forms or RRB Forms (Social Security Benefit forms and Railroad benefits forms)"
              />
              {data.hasSSA && (
                <TextField
                  label="If Yes, how many?"
                  type="number"
                  value={data.ssaCount || ''}
                  onChange={(e) => handleChange('ssaCount', e.target.value)}
                  size="small"
                  sx={{ mt: 1, ml: 3 }}
                />
              )}
            </Box>

            {/* 1099 G Forms */}
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={data.has1099G || false}
                    onChange={(e) => handleChange('has1099G', e.target.checked)}
                  />
                }
                label="1099 G Forms (Government payments or Unemployment)"
              />
              {data.has1099G && (
                <TextField
                  label="If Yes, how many?"
                  type="number"
                  value={data.form1099GCount || ''}
                  onChange={(e) => handleChange('form1099GCount', e.target.value)}
                  size="small"
                  sx={{ mt: 1, ml: 3 }}
                />
              )}
            </Box>

            {/* 1099 INT */}
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={data.has1099Int || false}
                    onChange={(e) => handleChange('has1099Int', e.target.checked)}
                  />
                }
                label="1099 INT- (Interest Income)"
              />
              {data.has1099Int && (
                <TextField
                  label="If Yes, how many?"
                  type="number"
                  value={data.form1099IntCount || ''}
                  onChange={(e) => handleChange('form1099IntCount', e.target.value)}
                  size="small"
                  sx={{ mt: 1, ml: 3 }}
                />
              )}
            </Box>

            {/* 1099 DIV */}
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={data.has1099Div || false}
                    onChange={(e) => handleChange('has1099Div', e.target.checked)}
                  />
                }
                label="1099 DIV (Dividend Income)"
              />
              {data.has1099Div && (
                <TextField
                  label="If Yes, how many?"
                  type="number"
                  value={data.form1099DivCount || ''}
                  onChange={(e) => handleChange('form1099DivCount', e.target.value)}
                  size="small"
                  sx={{ mt: 1, ml: 3 }}
                />
              )}
            </Box>

            {/* 1099-B */}
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={data.has1099B || false}
                    onChange={(e) => handleChange('has1099B', e.target.checked)}
                  />
                }
                label="1099-B (Stock Sales, Currency Trading, or Other Trading Activities)"
              />
              {data.has1099B && (
                <TextField
                  label="If Yes, how many?"
                  type="number"
                  value={data.form1099BCount || ''}
                  onChange={(e) => handleChange('form1099BCount', e.target.value)}
                  size="small"
                  sx={{ mt: 1, ml: 3 }}
                />
              )}
            </Box>

            {/* Crypto Currency */}
            <Box>
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
          </Box>
        </Box>
      </FormSection>

                    onChange={(e) => handleChange('otherIncome1Spouse', e.target.value)}
                    size="small"
                    fullWidth
                    InputProps={{ startAdornment: '$' }}
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>6. Other</TableCell>
                <TableCell>
                  <TextField
                    value={data.otherIncome2Taxpayer || ''}
                    onChange={(e) => handleChange('otherIncome2Taxpayer', e.target.value)}
                    size="small"
                    fullWidth
                    InputProps={{ startAdornment: '$' }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    value={data.otherIncome2Spouse || ''}
                    onChange={(e) => handleChange('otherIncome2Spouse', e.target.value)}
                    size="small"
                    fullWidth
                    InputProps={{ startAdornment: '$' }}
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>7. Other</TableCell>
                <TableCell>
                  <TextField
                    value={data.otherIncome3Taxpayer || ''}
                    onChange={(e) => handleChange('otherIncome3Taxpayer', e.target.value)}
                    size="small"
                    fullWidth
                    InputProps={{ startAdornment: '$' }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    value={data.otherIncome3Spouse || ''}
                    onChange={(e) => handleChange('otherIncome3Spouse', e.target.value)}
                    size="small"
                    fullWidth
                    InputProps={{ startAdornment: '$' }}
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>8. Other</TableCell>
                <TableCell>
                  <TextField
                    value={data.otherIncome4Taxpayer || ''}
                    onChange={(e) => handleChange('otherIncome4Taxpayer', e.target.value)}
                    size="small"
                    fullWidth
                    InputProps={{ startAdornment: '$' }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    value={data.otherIncome4Spouse || ''}
                    onChange={(e) => handleChange('otherIncome4Spouse', e.target.value)}
                    size="small"
                    fullWidth
                    InputProps={{ startAdornment: '$' }}
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </FormSection>

      <Paper sx={{ p: 2, backgroundColor: '#f0f9ff', border: '1px solid #bae6fd' }}>
        <Typography variant="body2" color="primary">
          📄 <strong>Attach all copies of your Tax Forms</strong>
        </Typography>
      </Paper>
    </Box>
  );
};