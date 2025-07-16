import React from 'react';
import {
  Box,
  TextField,
  Typography,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { FormSection } from '../../shared/FormSection';

export const DeductionsInfo = ({ data, onChange }) => {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <FormSection title="Medical and Dental Expenses">
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Medical expenses must exceed 7.5% of your adjusted gross income to be deductible.
        </Typography>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <TextField
            label="Prescription Medications"
            type="number"
            value={data.prescriptionMedications || ''}
            onChange={(e) => handleChange('prescriptionMedications', e.target.value)}
            InputProps={{ startAdornment: '$' }}
            fullWidth
          />
          <TextField
            label="Health Insurance Premiums"
            type="number"
            value={data.healthInsurancePremiums || ''}
            onChange={(e) => handleChange('healthInsurancePremiums', e.target.value)}
            InputProps={{ startAdornment: '$' }}
            fullWidth
          />
          <TextField
            label="Doctors, Dentists, etc."
            type="number"
            value={data.doctorsDentists || ''}
            onChange={(e) => handleChange('doctorsDentists', e.target.value)}
            InputProps={{ startAdornment: '$' }}
            fullWidth
          />
          <TextField
            label="Hospitals, Clinics"
            type="number"
            value={data.hospitalsClinics || ''}
            onChange={(e) => handleChange('hospitalsClinics', e.target.value)}
            InputProps={{ startAdornment: '$' }}
            fullWidth
          />
          <TextField
            label="Eyeglasses and Contact Lenses"
            type="number"
            value={data.eyeglassesContacts || ''}
            onChange={(e) => handleChange('eyeglassesContacts', e.target.value)}
            InputProps={{ startAdornment: '$' }}
            fullWidth
          />
          <TextField
            label="Medical Equipment and Supplies"
            type="number"
            value={data.medicalEquipment || ''}
            onChange={(e) => handleChange('medicalEquipment', e.target.value)}
            InputProps={{ startAdornment: '$' }}
            fullWidth
          />
        </Box>
      </FormSection>

      <FormSection title="Charitable Contributions">
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <TextField
            label="Cash Contributions"
            type="number"
            value={data.charitableCash || ''}
            onChange={(e) => handleChange('charitableCash', e.target.value)}
            InputProps={{ startAdornment: '$' }}
            fullWidth
          />
          <TextField
            label="Non-Cash Contributions"
            type="number"
            value={data.charitableNonCash || ''}
            onChange={(e) => handleChange('charitableNonCash', e.target.value)}
            InputProps={{ startAdornment: '$' }}
            fullWidth
            helperText="Fair market value of donated items"
          />
          <TextField
            label="Miles Driven for Charitable Purposes"
            type="number"
            value={data.charitableMiles || ''}
            onChange={(e) => handleChange('charitableMiles', e.target.value)}
            fullWidth
          />
          <TextField
            label="Parking/Tolls for Charitable Purposes"
            type="number"
            value={data.charitableParkingTolls || ''}
            onChange={(e) => handleChange('charitableParkingTolls', e.target.value)}
            InputProps={{ startAdornment: '$' }}
            fullWidth
          />
        </Box>
      </FormSection>

      <FormSection title="Taxes Paid">
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <TextField
            label="Real Estate Taxes (Principal Residence)"
            type="number"
            value={data.realEstateTaxesPrincipal || ''}
            onChange={(e) => handleChange('realEstateTaxesPrincipal', e.target.value)}
            InputProps={{ startAdornment: '$' }}
            fullWidth
          />
          <TextField
            label="Real Estate Taxes (Additional Homes)"
            type="number"
            value={data.realEstateTaxesAdditional || ''}
            onChange={(e) => handleChange('realEstateTaxesAdditional', e.target.value)}
            InputProps={{ startAdornment: '$' }}
            fullWidth
          />
          <TextField
            label="Auto Registration Fees"
            type="number"
            value={data.autoRegistrationFees || ''}
            onChange={(e) => handleChange('autoRegistrationFees', e.target.value)}
            InputProps={{ startAdornment: '$' }}
            fullWidth
            helperText="Based on value of vehicle"
          />
          <TextField
            label="Other Personal Property Taxes"
            type="number"
            value={data.otherPersonalPropertyTaxes || ''}
            onChange={(e) => handleChange('otherPersonalPropertyTaxes', e.target.value)}
            InputProps={{ startAdornment: '$' }}
            fullWidth
          />
        </Box>
      </FormSection>

      <FormSection title="Interest Paid">
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <TextField
            label="Home Mortgage Interest"
            type="number"
            value={data.mortgageInterest || ''}
            onChange={(e) => handleChange('mortgageInterest', e.target.value)}
            InputProps={{ startAdornment: '$' }}
            fullWidth
          />
          <TextField
            label="Student Loan Interest"
            type="number"
            value={data.studentLoanInterest || ''}
            onChange={(e) => handleChange('studentLoanInterest', e.target.value)}
            InputProps={{ startAdornment: '$' }}
            fullWidth
          />
        </Box>
      </FormSection>

      <FormSection title="Business Expenses (Employee)">
        <FormControlLabel
          control={
            <Switch
              checked={data.hasBusinessExpenses || false}
              onChange={(e) => handleChange('hasBusinessExpenses', e.target.checked)}
            />
          }
          label="Do you have unreimbursed employee business expenses?"
        />
        
        {data.hasBusinessExpenses && (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mt: 2 }}>
            <TextField
              label="Business Miles Driven"
              type="number"
              value={data.businessMiles || ''}
              onChange={(e) => handleChange('businessMiles', e.target.value)}
              fullWidth
            />
            <TextField
              label="Total Vehicle Miles"
              type="number"
              value={data.totalMiles || ''}
              onChange={(e) => handleChange('totalMiles', e.target.value)}
              fullWidth
            />
          </Box>
        )}
      </FormSection>
    </Box>
  );
};