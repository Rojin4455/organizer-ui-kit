import React from 'react';
import { Box, TextField, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { FormSection } from '../../shared/FormSection';

export const BusinessIncomeExpenses = ({ data, onChange }) => {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  const handleVehicleChange = (vehicleIndex, field, value) => {
    const vehicles = data.vehicles || [{}, {}];
    vehicles[vehicleIndex] = { ...vehicles[vehicleIndex], [field]: value };
    onChange({ ...data, vehicles });
  };

  const handleOtherExpenseChange = (index, field, value) => {
    const otherExpenses = data.otherExpenses || [{}, {}, {}, {}];
    otherExpenses[index] = { ...otherExpenses[index], [field]: value };
    onChange({ ...data, otherExpenses });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <FormSection title="Income">
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <TextField
            label="Gross receipts or sales"
            type="number"
            value={data.grossReceipts || ''}
            onChange={(e) => handleChange('grossReceipts', e.target.value)}
            InputProps={{ startAdornment: '$' }}
            fullWidth
          />
          <TextField
            label="Returns and allowances"
            type="number"
            value={data.returnsAllowances || ''}
            onChange={(e) => handleChange('returnsAllowances', e.target.value)}
            InputProps={{ startAdornment: '$' }}
            fullWidth
          />
          <TextField
            label="Interest income/Trust deed income"
            type="number"
            value={data.interestIncome || ''}
            onChange={(e) => handleChange('interestIncome', e.target.value)}
            InputProps={{ startAdornment: '$' }}
            fullWidth
          />
          <TextField
            label="Other income From Business"
            type="number"
            value={data.otherIncome || ''}
            onChange={(e) => handleChange('otherIncome', e.target.value)}
            InputProps={{ startAdornment: '$' }}
            fullWidth
          />
        </Box>
      </FormSection>

      <FormSection title="Cost of Goods Sold">
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <TextField
            label="Inventory at beginning of year"
            type="number"
            value={data.inventoryBeginning || ''}
            onChange={(e) => handleChange('inventoryBeginning', e.target.value)}
            InputProps={{ startAdornment: '$' }}
            fullWidth
          />
          <TextField
            label="Inventory at end of year"
            type="number"
            value={data.inventoryEnd || ''}
            onChange={(e) => handleChange('inventoryEnd', e.target.value)}
            InputProps={{ startAdornment: '$' }}
            fullWidth
          />
          <TextField
            label="Purchases"
            type="number"
            value={data.purchases || ''}
            onChange={(e) => handleChange('purchases', e.target.value)}
            InputProps={{ startAdornment: '$' }}
            fullWidth
          />
          <TextField
            label="Cost of items for personal use"
            type="number"
            value={data.costPersonalUse || ''}
            onChange={(e) => handleChange('costPersonalUse', e.target.value)}
            InputProps={{ startAdornment: '$' }}
            fullWidth
          />
          <TextField
            label="Contracted Labor (do not include payments to yourself)"
            type="number"
            value={data.contractedLabor || ''}
            onChange={(e) => handleChange('contractedLabor', e.target.value)}
            InputProps={{ startAdornment: '$' }}
            fullWidth
          />
          <TextField
            label="Materials and supplies"
            type="number"
            value={data.materialsSupplies || ''}
            onChange={(e) => handleChange('materialsSupplies', e.target.value)}
            InputProps={{ startAdornment: '$' }}
            fullWidth
          />
          <TextField
            label="Other costs"
            type="number"
            value={data.otherCosts || ''}
            onChange={(e) => handleChange('otherCosts', e.target.value)}
            InputProps={{ startAdornment: '$' }}
            fullWidth
          />
        </Box>
      </FormSection>

      <FormSection title="Business Income and Expenses (Cont.)">
        <Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic' }}>
          Because IRS some expenses do not apply, please leave that category blank.
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <TextField
            label="Advertising"
            type="number"
            value={data.advertising || ''}
            onChange={(e) => handleChange('advertising', e.target.value)}
            InputProps={{ startAdornment: '$' }}
            fullWidth
          />
          <TextField
            label="Office Expenses"
            type="number"
            value={data.officeExpenses || ''}
            onChange={(e) => handleChange('officeExpenses', e.target.value)}
            InputProps={{ startAdornment: '$' }}
            fullWidth
          />
          <TextField
            label="Bank Fees"
            type="number"
            value={data.bankFees || ''}
            onChange={(e) => handleChange('bankFees', e.target.value)}
            InputProps={{ startAdornment: '$' }}
            fullWidth
          />
          <TextField
            label="Other Interest"
            type="number"
            value={data.otherInterest || ''}
            onChange={(e) => handleChange('otherInterest', e.target.value)}
            InputProps={{ startAdornment: '$' }}
            fullWidth
          />
          <TextField
            label="Commissions"
            type="number"
            value={data.commissions || ''}
            onChange={(e) => handleChange('commissions', e.target.value)}
            InputProps={{ startAdornment: '$' }}
            fullWidth
          />
          <TextField
            label="Parking & Tolls"
            type="number"
            value={data.parkingTolls || ''}
            onChange={(e) => handleChange('parkingTolls', e.target.value)}
            InputProps={{ startAdornment: '$' }}
            fullWidth
          />
          <TextField
            label="Computer Purchase"
            type="number"
            value={data.computerPurchase || ''}
            onChange={(e) => handleChange('computerPurchase', e.target.value)}
            InputProps={{ startAdornment: '$' }}
            fullWidth
          />
          <TextField
            label="Rent - other business property"
            type="number"
            value={data.rentOtherBusiness || ''}
            onChange={(e) => handleChange('rentOtherBusiness', e.target.value)}
            InputProps={{ startAdornment: '$' }}
            fullWidth
          />
          <TextField
            label="Consulting/Training"
            type="number"
            value={data.consultingTraining || ''}
            onChange={(e) => handleChange('consultingTraining', e.target.value)}
            InputProps={{ startAdornment: '$' }}
            fullWidth
          />
          <TextField
            label="Rent - vehicles machinery & equipment"
            type="number"
            value={data.rentVehiclesMachinery || ''}
            onChange={(e) => handleChange('rentVehiclesMachinery', e.target.value)}
            InputProps={{ startAdornment: '$' }}
            fullWidth
          />
          <TextField
            label="Dues and Subscriptions"
            type="number"
            value={data.duesSubscriptions || ''}
            onChange={(e) => handleChange('duesSubscriptions', e.target.value)}
            InputProps={{ startAdornment: '$' }}
            fullWidth
          />
          <TextField
            label="Repairs"
            type="number"
            value={data.repairs || ''}
            onChange={(e) => handleChange('repairs', e.target.value)}
            InputProps={{ startAdornment: '$' }}
            fullWidth
          />
          <TextField
            label="Entity Creation"
            type="number"
            value={data.entityCreation || ''}
            onChange={(e) => handleChange('entityCreation', e.target.value)}
            InputProps={{ startAdornment: '$' }}
            fullWidth
          />
          <TextField
            label="Shipping/Postage"
            type="number"
            value={data.shippingPostage || ''}
            onChange={(e) => handleChange('shippingPostage', e.target.value)}
            InputProps={{ startAdornment: '$' }}
            fullWidth
          />
          <TextField
            label="Food/Eat Out"
            type="number"
            value={data.foodEatOut || ''}
            onChange={(e) => handleChange('foodEatOut', e.target.value)}
            InputProps={{ startAdornment: '$' }}
            fullWidth
          />
          <TextField
            label="Taxes - real estate"
            type="number"
            value={data.taxesRealEstate || ''}
            onChange={(e) => handleChange('taxesRealEstate', e.target.value)}
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
            label="Taxes - other"
            type="number"
            value={data.taxesOther || ''}
            onChange={(e) => handleChange('taxesOther', e.target.value)}
            InputProps={{ startAdornment: '$' }}
            fullWidth
          />
          <TextField
            label="Insurance other than health"
            type="number"
            value={data.insuranceOtherHealth || ''}
            onChange={(e) => handleChange('insuranceOtherHealth', e.target.value)}
            InputProps={{ startAdornment: '$' }}
            fullWidth
          />
          <TextField
            label="Telephone"
            type="number"
            value={data.telephone || ''}
            onChange={(e) => handleChange('telephone', e.target.value)}
            InputProps={{ startAdornment: '$' }}
            fullWidth
          />
          <TextField
            label="Interest (mortgage, etc.)"
            type="number"
            value={data.interestMortgage || ''}
            onChange={(e) => handleChange('interestMortgage', e.target.value)}
            InputProps={{ startAdornment: '$' }}
            fullWidth
          />
          <TextField
            label="Total meals"
            type="number"
            value={data.totalMeals || ''}
            onChange={(e) => handleChange('totalMeals', e.target.value)}
            InputProps={{ startAdornment: '$' }}
            fullWidth
          />
          <TextField
            label="Internet"
            type="number"
            value={data.internet || ''}
            onChange={(e) => handleChange('internet', e.target.value)}
            InputProps={{ startAdornment: '$' }}
            fullWidth
          />
          <TextField
            label="Travel"
            type="number"
            value={data.travel || ''}
            onChange={(e) => handleChange('travel', e.target.value)}
            InputProps={{ startAdornment: '$' }}
            fullWidth
          />
          <TextField
            label="Legal & Professional"
            type="number"
            value={data.legalProfessional || ''}
            onChange={(e) => handleChange('legalProfessional', e.target.value)}
            InputProps={{ startAdornment: '$' }}
            fullWidth
          />
          <TextField
            label="Utilities"
            type="number"
            value={data.utilities || ''}
            onChange={(e) => handleChange('utilities', e.target.value)}
            InputProps={{ startAdornment: '$' }}
            fullWidth
          />
          <TextField
            label="Licenses"
            type="number"
            value={data.licenses || ''}
            onChange={(e) => handleChange('licenses', e.target.value)}
            InputProps={{ startAdornment: '$' }}
            fullWidth
          />
          <TextField
            label="Wages"
            type="number"
            value={data.wages || ''}
            onChange={(e) => handleChange('wages', e.target.value)}
            InputProps={{ startAdornment: '$' }}
            fullWidth
          />
          <TextField
            label="Merchant fees"
            type="number"
            value={data.merchantFees || ''}
            onChange={(e) => handleChange('merchantFees', e.target.value)}
            InputProps={{ startAdornment: '$' }}
            fullWidth
          />
          <TextField
            label="Web Fees"
            type="number"
            value={data.webFees || ''}
            onChange={(e) => handleChange('webFees', e.target.value)}
            InputProps={{ startAdornment: '$' }}
            fullWidth
          />
          <TextField
            label="Wholesale/Drop Shipper fees"
            type="number"
            value={data.wholesaleDropShipper || ''}
            onChange={(e) => handleChange('wholesaleDropShipper', e.target.value)}
            InputProps={{ startAdornment: '$' }}
            fullWidth
            sx={{ gridColumn: { md: 'span 2' } }}
          />
        </Box>
      </FormSection>

      <FormSection title="Vehicle Mileage">
        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell></TableCell>
                <TableCell align="center">VEHICLE 1</TableCell>
                <TableCell align="center">VEHICLE 2</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell><strong>Description of vehicle</strong></TableCell>
                <TableCell>
                  <TextField
                    value={data.vehicles?.[0]?.description || ''}
                    onChange={(e) => handleVehicleChange(0, 'description', e.target.value)}
                    size="small"
                    fullWidth
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    value={data.vehicles?.[1]?.description || ''}
                    onChange={(e) => handleVehicleChange(1, 'description', e.target.value)}
                    size="small"
                    fullWidth
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>Date placed in service</strong></TableCell>
                <TableCell>
                  <TextField
                    type="date"
                    value={data.vehicles?.[0]?.datePlacedInService || ''}
                    onChange={(e) => handleVehicleChange(0, 'datePlacedInService', e.target.value)}
                    size="small"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    type="date"
                    value={data.vehicles?.[1]?.datePlacedInService || ''}
                    onChange={(e) => handleVehicleChange(1, 'datePlacedInService', e.target.value)}
                    size="small"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>Total miles for the year</strong></TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    value={data.vehicles?.[0]?.totalMiles || ''}
                    onChange={(e) => handleVehicleChange(0, 'totalMiles', e.target.value)}
                    size="small"
                    fullWidth
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    value={data.vehicles?.[1]?.totalMiles || ''}
                    onChange={(e) => handleVehicleChange(1, 'totalMiles', e.target.value)}
                    size="small"
                    fullWidth
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>Business miles</strong></TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    value={data.vehicles?.[0]?.businessMiles || ''}
                    onChange={(e) => handleVehicleChange(0, 'businessMiles', e.target.value)}
                    size="small"
                    fullWidth
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    value={data.vehicles?.[1]?.businessMiles || ''}
                    onChange={(e) => handleVehicleChange(1, 'businessMiles', e.target.value)}
                    size="small"
                    fullWidth
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </FormSection>

      <FormSection title="Other Expenses">
        <Typography variant="body2" sx={{ mb: 2 }}>
          *Other:
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          {[0, 1, 2, 3].map((index) => (
            <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField
                placeholder="Description"
                value={data.otherExpenses?.[index]?.description || ''}
                onChange={(e) => handleOtherExpenseChange(index, 'description', e.target.value)}
                size="small"
                sx={{ flex: 1 }}
              />
              <TextField
                type="number"
                placeholder="Amount"
                value={data.otherExpenses?.[index]?.amount || ''}
                onChange={(e) => handleOtherExpenseChange(index, 'amount', e.target.value)}
                InputProps={{ startAdornment: '$' }}
                size="small"
                sx={{ width: 120 }}
              />
            </Box>
          ))}
        </Box>
        <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
          *Include additional expenses as needed by attaching an additional schedule detailing the expense category and amount.
        </Typography>
      </FormSection>

      <FormSection title="Business Use of Home">
        <Typography variant="body2" sx={{ mb: 2 }}>
          Check if you acquired or disposed of any business assets (including real estate) during the year.
          If yes, provide detailed schedule.
        </Typography>
      </FormSection>
    </Box>
  );
};