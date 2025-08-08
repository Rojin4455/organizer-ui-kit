import React from 'react';
import {
  Box,
  TextField,
  Typography,
  Divider,
} from '@mui/material';
import { FormSection } from '../../shared/FormSection';

export const RentalIncomeExpenses = ({ data, onChange }) => {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <FormSection title="Property Income and Expenses" isSecure>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Typography variant="h6" sx={{ color: 'primary.main' }}>
            Property Income
          </Typography>
          
          <TextField
            label="Rents received"
            value={data.rentsReceived || ''}
            onChange={(e) => handleChange('rentsReceived', e.target.value)}
            type="number"
            inputProps={{ min: 0, step: 'any' }}
            fullWidth
          />

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" sx={{ color: 'primary.main' }}>
            Expenses
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <TextField
              label="Advertising"
              helperText="Ex. Rental Ads, Newspaper Ads"
              value={data.advertising || ''}
              onChange={(e) => handleChange('advertising', e.target.value)}
              type="number"
              inputProps={{ min: 0, step: 'any' }}
              fullWidth
            />
            <TextField
              label="Association dues"
              helperText="Ex. HOA"
              value={data.associationDues || ''}
              onChange={(e) => handleChange('associationDues', e.target.value)}
              type="number"
              inputProps={{ min: 0, step: 'any' }}
              fullWidth
            />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <TextField
              label="Auto and travel"
              helperText="Mileage associated with Property"
              value={data.autoAndTravel || ''}
              onChange={(e) => handleChange('autoAndTravel', e.target.value)}
              type="number"
              inputProps={{ min: 0, step: 'any' }}
              fullWidth
            />
            <TextField
              label="Cleaning/Maintenance"
              helperText="Gardening, Landscaping"
              value={data.cleaningMaintenance || ''}
              onChange={(e) => handleChange('cleaningMaintenance', e.target.value)}
              type="number"
              inputProps={{ min: 0, step: 'any' }}
              fullWidth
            />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <TextField
              label="Insurance"
              helperText="Homeowners Insurance"
              value={data.insurance || ''}
              onChange={(e) => handleChange('insurance', e.target.value)}
              type="number"
              inputProps={{ min: 0, step: 'any' }}
              fullWidth
            />
            <TextField
              label="Professional fees"
              helperText="Prop Management and Book Keepers"
              value={data.professionalFees || ''}
              onChange={(e) => handleChange('professionalFees', e.target.value)}
              type="number"
              inputProps={{ min: 0, step: 'any' }}
              fullWidth
            />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <TextField
              label="Mortgage interest"
              helperText="Rental Property Mortgage Interest"
              value={data.mortgageInterest || ''}
              onChange={(e) => handleChange('mortgageInterest', e.target.value)}
              type="number"
              inputProps={{ min: 0, step: 'any' }}
              fullWidth
            />
            <TextField
              label="Repairs and Maintenance"
              helperText="Leaky roof, cracked driveway, etc"
              value={data.repairsMaintenance || ''}
              onChange={(e) => handleChange('repairsMaintenance', e.target.value)}
              type="number"
              inputProps={{ min: 0, step: 'any' }}
              fullWidth
            />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <TextField
              label="Taxes"
              helperText="Property Tax Information"
              value={data.taxes || ''}
              onChange={(e) => handleChange('taxes', e.target.value)}
              type="number"
              inputProps={{ min: 0, step: 'any' }}
              fullWidth
            />
            <TextField
              label="Utilities"
              helperText="Electric, Gas, Trash, Water"
              value={data.utilities || ''}
              onChange={(e) => handleChange('utilities', e.target.value)}
              type="number"
              inputProps={{ min: 0, step: 'any' }}
              fullWidth
            />
          </Box>
        </Box>
      </FormSection>
    </Box>
  );
};