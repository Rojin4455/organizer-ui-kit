import React from 'react';
import {
  Typography,
  TextField,
  Grid,
  Box,
  Paper,
} from '@mui/material';
import { FormSection } from '../../shared/FormSection';

export const RentalIncomeExpenses = ({ data, onChange, onNext, onBack }) => {
  const handleIncomeChange = (field, value) => {
    const income = data.income || {};
    const newData = {
      ...data,
      income: { ...income, [field]: value }
    };
    onChange(newData);
  };

  const handleExpenseChange = (field, value) => {
    const expenses = data.expenses || {};
    const newData = {
      ...data,
      expenses: { ...expenses, [field]: value }
    };
    onChange(newData);
  };

  const handleOtherExpenseChange = (index, field, value) => {
    const otherExpenses = data.expenses?.other || ['', '', ''];
    const newOtherExpenses = [...otherExpenses];
    newOtherExpenses[index] = { ...newOtherExpenses[index], [field]: value };
    
    const newData = {
      ...data,
      expenses: {
        ...data.expenses,
        other: newOtherExpenses
      }
    };
    onChange(newData);
  };

  return (
    <FormSection
      title="Property Income and Expenses"
      onNext={onNext}
      onBack={onBack}
    >
      {/* Property Income Section */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.50' }}>
        <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
          Property Income
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Rents received"
              value={data.income?.rentsReceived || ''}
              onChange={(e) => handleIncomeChange('rentsReceived', e.target.value)}
              variant="outlined"
              type="number"
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Expenses Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, color: 'error.main' }}>
          Expenses
        </Typography>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Advertising"
              helperText="(Ex. Rental Ads, Newspaper Ads)"
              value={data.expenses?.advertising || ''}
              onChange={(e) => handleExpenseChange('advertising', e.target.value)}
              variant="outlined"
              type="number"
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
              }}
            />
          </Grid>
        </Grid>

        <Typography variant="subtitle2" sx={{ mb: 2 }}>Appliances - Add Dates:</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
          (ex. Washer & Dryer, Refrigerator)
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {[0, 1, 2].map((index) => (
            <Grid item xs={12} md={6} key={index}>
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <TextField
                    fullWidth
                    label={`Appliance ${index + 1}`}
                    value={data.expenses?.appliances?.[index]?.description || ''}
                    onChange={(e) => {
                      const appliances = data.expenses?.appliances || [{}, {}, {}];
                      const newAppliances = [...appliances];
                      newAppliances[index] = { ...newAppliances[index], description: e.target.value };
                      handleExpenseChange('appliances', newAppliances);
                    }}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label="Cost"
                    value={data.expenses?.appliances?.[index]?.cost || ''}
                    onChange={(e) => {
                      const appliances = data.expenses?.appliances || [{}, {}, {}];
                      const newAppliances = [...appliances];
                      newAppliances[index] = { ...newAppliances[index], cost: e.target.value };
                      handleExpenseChange('appliances', newAppliances);
                    }}
                    variant="outlined"
                    size="small"
                    type="number"
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Association dues"
              helperText="(ex. HOA)"
              value={data.expenses?.associationDues || ''}
              onChange={(e) => handleExpenseChange('associationDues', e.target.value)}
              variant="outlined"
              type="number"
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Auto and travel"
              helperText="(ex Mileage associated with Property)"
              value={data.expenses?.autoAndTravel || ''}
              onChange={(e) => handleExpenseChange('autoAndTravel', e.target.value)}
              variant="outlined"
              type="number"
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
              }}
            />
          </Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Cleaning/Maintenance"
              helperText="(ex. Gardening, Landscaping)"
              value={data.expenses?.cleaningMaintenance || ''}
              onChange={(e) => handleExpenseChange('cleaningMaintenance', e.target.value)}
              variant="outlined"
              type="number"
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Commissions"
              helperText="(ex. Someone who is paid for finding a renter)"
              value={data.expenses?.commissions || ''}
              onChange={(e) => handleExpenseChange('commissions', e.target.value)}
              variant="outlined"
              type="number"
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
              }}
            />
          </Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Insurance"
              helperText="(ex. Homeowners Insurance)"
              value={data.expenses?.insurance || ''}
              onChange={(e) => handleExpenseChange('insurance', e.target.value)}
              variant="outlined"
              type="number"
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Professional fees"
              helperText="(ex. Prop Management and Book Keepers)"
              value={data.expenses?.professionalFees || ''}
              onChange={(e) => handleExpenseChange('professionalFees', e.target.value)}
              variant="outlined"
              type="number"
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
              }}
            />
          </Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Mortgage interest"
              helperText="(ex. Rental Property Mortgage Interest)"
              value={data.expenses?.mortgageInterest || ''}
              onChange={(e) => handleExpenseChange('mortgageInterest', e.target.value)}
              variant="outlined"
              type="number"
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Other Interest"
              helperText="(ex.Credit Card Interest Accrued for Rental Repairs)"
              value={data.expenses?.otherInterest || ''}
              onChange={(e) => handleExpenseChange('otherInterest', e.target.value)}
              variant="outlined"
              type="number"
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
              }}
            />
          </Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Repairs and Maintenance"
              helperText="(ex. Leaky roof, cracked driveway, broken windows, etc)"
              value={data.expenses?.repairsMaintenance || ''}
              onChange={(e) => handleExpenseChange('repairsMaintenance', e.target.value)}
              variant="outlined"
              type="number"
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Taxes"
              helperText="(ex. Property Tax Information)"
              value={data.expenses?.taxes || ''}
              onChange={(e) => handleExpenseChange('taxes', e.target.value)}
              variant="outlined"
              type="number"
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
              }}
            />
          </Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Utilities"
              helperText="(ex. Electric, Gas, Trash, Water)"
              value={data.expenses?.utilities || ''}
              onChange={(e) => handleExpenseChange('utilities', e.target.value)}
              variant="outlined"
              type="number"
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Improvements"
              helperText="(Please Add Dates and Description)"
              value={data.expenses?.improvements || ''}
              onChange={(e) => handleExpenseChange('improvements', e.target.value)}
              variant="outlined"
              type="number"
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
              }}
            />
          </Grid>
        </Grid>

        <Typography variant="subtitle2" sx={{ mb: 2 }}>Other:</Typography>
        <Grid container spacing={3}>
          {[0, 1, 2].map((index) => (
            <Grid item xs={12} md={6} key={index}>
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <TextField
                    fullWidth
                    label={`Other Expense ${index + 1}`}
                    value={data.expenses?.other?.[index]?.description || ''}
                    onChange={(e) => handleOtherExpenseChange(index, 'description', e.target.value)}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label="Amount"
                    value={data.expenses?.other?.[index]?.amount || ''}
                    onChange={(e) => handleOtherExpenseChange(index, 'amount', e.target.value)}
                    variant="outlined"
                    size="small"
                    type="number"
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </FormSection>
  );
};