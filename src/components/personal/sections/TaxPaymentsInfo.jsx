import React from 'react';
import {
  Box,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
} from '@mui/material';
import { FormSection } from '../../shared/FormSection';

export const TaxPaymentsInfo = ({ data, onChange }) => {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  const medicalExpenses = [
    'Prescription medications',
    'Health insurance premiums (enter Medicare B on QRG6)',
    'Qualified long-term care premiums',
    "Taxpayer's gross long-term care premiums",
    "Spouse's gross long-term care premiums",
    "Dependent's gross long-term care premiums",
    'Enter self-employed health insurance premiums',
    'Insurance reimbursement',
    'Medical savings account (MSA) distributions',
    'Doctors, dentists, etc',
    'Hospitals, clinics, etc',
    'Lab and X-ray fees',
    'Expenses for qualified long-term care',
    'Eyeglasses and contact lenses',
    'Medical equipment and supplies',
    'Miles driven for medical purposes',
    'Ambulance fees and other medical transportation costs',
    'Lodging',
    'Other medical and dental expenses a.',
    'Other medical and dental expenses b.',
    'Other medical and dental expenses c.',
  ];

  const taxPayments = [
    'Real estate taxes paid on principal residence',
    'Real estate taxes paid on additional homes or land (Not Rentals)',
    'Auto registration fees based on the value of the vehicle',
    'Other personal property taxes',
    'Other taxes:',
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <FormSection title="Medical and Tax Expenses">
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          If you are under the age of 65 the totals will need to be over 10% of your Adjusted Gross Income to qualify as a deductible. If you are over the age 65 it will be 7.5% of your Adjusted Gross Income.
        </Typography>
        
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          MEDICAL AND DENTAL EXPENSES
        </Typography>
        
        <TableContainer component={Paper} sx={{ mb: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '60%', fontWeight: 'bold' }}>Description</TableCell>
                <TableCell sx={{ width: '40%', fontWeight: 'bold', textAlign: 'center' }}>
                  CURRENT YEAR AMOUNT
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {medicalExpenses.map((expense, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {index + 1}. {expense}
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      value={data[`medicalExpense${index + 1}`] || ''}
                      onChange={(e) => handleChange(`medicalExpense${index + 1}`, e.target.value)}
                      InputProps={{ startAdornment: '$' }}
                      fullWidth
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          TAX PAYMENTS
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Please include money that you paid directly to the IRS, not money that was withheld from your normal earnings.
        </Typography>

        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
          TAXES
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          This is outside of W-2 income or Standard amounts withheld.
        </Typography>

        <TableContainer component={Paper} sx={{ mb: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '60%', fontWeight: 'bold' }}>Description</TableCell>
                <TableCell sx={{ width: '40%', fontWeight: 'bold', textAlign: 'center' }}>
                  CURRENT YEAR AMOUNT
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {taxPayments.map((tax, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {index + 1}. {tax}
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      value={data[`taxPayment${index + 1}`] || ''}
                      onChange={(e) => handleChange(`taxPayment${index + 1}`, e.target.value)}
                      InputProps={{ startAdornment: '$' }}
                      fullWidth
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          CURRENT YEAR ESTIMATED TAX PAYMENT
        </Typography>

        <TableContainer component={Paper} sx={{ mb: 3 }}>
          <Table sx={{ tableLayout: 'fixed' }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ 
                  width: '30%', 
                  fontWeight: 'bold', 
                  padding: '16px 12px',
                  fontSize: '14px'
                }}>
                  Quarter
                </TableCell>
                <TableCell sx={{ 
                  width: '12%', 
                  fontWeight: 'bold', 
                  textAlign: 'center',
                  padding: '16px 8px',
                  fontSize: '12px',
                  lineHeight: '1.2'
                }}>
                  FEDERAL<br />DATE
                </TableCell>
                <TableCell sx={{ 
                  width: '12%', 
                  fontWeight: 'bold', 
                  textAlign: 'center',
                  padding: '16px 8px',
                  fontSize: '12px',
                  lineHeight: '1.2'
                }}>
                  FEDERAL<br />AMOUNT
                </TableCell>
                <TableCell sx={{ 
                  width: '12%', 
                  fontWeight: 'bold', 
                  textAlign: 'center',
                  padding: '16px 8px',
                  fontSize: '12px',
                  lineHeight: '1.2'
                }}>
                  STATE<br />DATE
                </TableCell>
                <TableCell sx={{ 
                  width: '12%', 
                  fontWeight: 'bold', 
                  textAlign: 'center',
                  padding: '16px 8px',
                  fontSize: '12px',
                  lineHeight: '1.2'
                }}>
                  STATE<br />AMOUNT
                </TableCell>
                <TableCell sx={{ 
                  width: '6%', 
                  fontWeight: 'bold', 
                  textAlign: 'center',
                  padding: '16px 4px',
                  fontSize: '12px'
                }}>
                  ID
                </TableCell>
                <TableCell sx={{ 
                  width: '10%', 
                  fontWeight: 'bold', 
                  textAlign: 'center',
                  padding: '16px 8px',
                  fontSize: '12px',
                  lineHeight: '1.2'
                }}>
                  LOCAL<br />DATE
                </TableCell>
                <TableCell sx={{ 
                  width: '10%', 
                  fontWeight: 'bold', 
                  textAlign: 'center',
                  padding: '16px 8px',
                  fontSize: '12px',
                  lineHeight: '1.2'
                }}>
                  LOCAL<br />AMOUNT
                </TableCell>
                <TableCell sx={{ 
                  width: '6%', 
                  fontWeight: 'bold', 
                  textAlign: 'center',
                  padding: '16px 4px',
                  fontSize: '12px'
                }}>
                  ID
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[
                '6. Qtr 1 due by 04/15 of current year',
                '7. Qtr 2 due by 06/15 of current year',
                '8. Qtr 3 due by 09/15 of current year',
                '9. Qtr 4 due by 01/15 of following year',
                '10. a. Additional payments',
                'b. Additional payments',
                '11. Prior year overpayment applied to current year',
              ].map((quarter, index) => (
                <TableRow key={index} sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.02)' } }}>
                  <TableCell sx={{ padding: '20px 12px', fontSize: '13px' }}>
                    {quarter}
                  </TableCell>
                  <TableCell sx={{ padding: '16px 8px' }}>
                    <TextField
                      type="date"
                      value={data[`federalDate${index + 1}`] || ''}
                      onChange={(e) => handleChange(`federalDate${index + 1}`, e.target.value)}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        '& .MuiInputBase-root': {
                          height: '40px',
                          fontSize: '12px'
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ padding: '16px 8px' }}>
                    <TextField
                      type="number"
                      value={data[`federalAmount${index + 1}`] || ''}
                      onChange={(e) => handleChange(`federalAmount${index + 1}`, e.target.value)}
                      InputProps={{ startAdornment: '$' }}
                      fullWidth
                      sx={{
                        '& .MuiInputBase-root': {
                          height: '40px',
                          fontSize: '12px'
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ padding: '16px 8px' }}>
                    <TextField
                      type="date"
                      value={data[`stateDate${index + 1}`] || ''}
                      onChange={(e) => handleChange(`stateDate${index + 1}`, e.target.value)}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        '& .MuiInputBase-root': {
                          height: '40px',
                          fontSize: '12px'
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ padding: '16px 8px' }}>
                    <TextField
                      type="number"
                      value={data[`stateAmount${index + 1}`] || ''}
                      onChange={(e) => handleChange(`stateAmount${index + 1}`, e.target.value)}
                      InputProps={{ startAdornment: '$' }}
                      fullWidth
                      sx={{
                        '& .MuiInputBase-root': {
                          height: '40px',
                          fontSize: '12px'
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ padding: '16px 4px' }}>
                    <TextField
                      value={data[`stateId${index + 1}`] || ''}
                      onChange={(e) => handleChange(`stateId${index + 1}`, e.target.value)}
                      fullWidth
                      sx={{
                        '& .MuiInputBase-root': {
                          height: '40px',
                          fontSize: '12px'
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ padding: '16px 8px' }}>
                    <TextField
                      type="date"
                      value={data[`localDate${index + 1}`] || ''}
                      onChange={(e) => handleChange(`localDate${index + 1}`, e.target.value)}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        '& .MuiInputBase-root': {
                          height: '40px',
                          fontSize: '12px'
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ padding: '16px 8px' }}>
                    <TextField
                      type="number"
                      value={data[`localAmount${index + 1}`] || ''}
                      onChange={(e) => handleChange(`localAmount${index + 1}`, e.target.value)}
                      InputProps={{ startAdornment: '$' }}
                      fullWidth
                      sx={{
                        '& .MuiInputBase-root': {
                          height: '40px',
                          fontSize: '12px'
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ padding: '16px 4px' }}>
                    <TextField
                      value={data[`localId${index + 1}`] || ''}
                      onChange={(e) => handleChange(`localId${index + 1}`, e.target.value)}
                      fullWidth
                      sx={{
                        '& .MuiInputBase-root': {
                          height: '40px',
                          fontSize: '12px'
                        }
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          NOTES: (additional information)
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {[...Array(10)].map((_, index) => (
            <TextField
              key={index}
              value={data[`note${index + 1}`] || ''}
              onChange={(e) => handleChange(`note${index + 1}`, e.target.value)}
              fullWidth
              size="small"
              variant="standard"
              sx={{ 
                '& .MuiInput-underline:before': {
                  borderBottomColor: 'rgba(0, 0, 0, 0.42)',
                },
              }}
            />
          ))}
        </Box>
      </FormSection>
    </Box>
  );
};