import React from 'react';
import { Box, TextField, Typography, Paper } from '@mui/material';
import { FormSection } from '../../shared/FormSection';

const toNum = (v) => (v === '' || v == null ? NaN : Number(String(v).replace(/[^0-9.-]/g, '')));
const formatCurrency = (n) => (Number.isFinite(n) ? `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '');

export const FlipSummary = ({ data, onChange }) => {
  const summary = data.summary || {};
  const flipInfo = data.flipInfo || {};
  const salesInfo = data.salesInfo || {};
  const purchaseInfo = data.purchaseInfo || {};
  const holdingCosts = data.holdingCosts || {};

  const handleChange = (field, value) => {
    onChange({ ...data, summary: { ...summary, [field]: value } });
  };

  const purchaseCost = toNum(purchaseInfo.purchaseCost);
  const otherPurchaseCosts = toNum(purchaseInfo.otherPurchaseCosts);
  const remodelFixUpCosts = toNum(purchaseInfo.remodelFixUpCosts);
  const holding = toNum(holdingCosts.holdingCosts);
  const totalBasisCalculated =
    [purchaseCost, otherPurchaseCosts, remodelFixUpCosts, holding].every(Number.isFinite)
      ? purchaseCost + otherPurchaseCosts + remodelFixUpCosts + holding
      : null;

  const salesPrice = toNum(salesInfo.salesPrice);
  const salesExpenses = toNum(salesInfo.salesExpenses);
  const totalProceeds = salesInfo.totalProceeds !== undefined && salesInfo.totalProceeds !== ''
    ? toNum(salesInfo.totalProceeds)
    : (Number.isFinite(salesPrice) && Number.isFinite(salesExpenses) ? salesPrice - salesExpenses : null);
  const subtract = toNum(summary.subtract);
  const profitLossCalculated =
    totalProceeds != null && totalBasisCalculated != null
      ? totalProceeds - totalBasisCalculated - (Number.isFinite(subtract) ? subtract : 0)
      : null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Calculated totals – always displayed when inputs are present */}
      {(totalBasisCalculated != null || profitLossCalculated != null) && (
        <Paper elevation={0} sx={{ p: 2, bgcolor: '#eff6ff', border: '1px solid', borderColor: '#93c5fd', borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: '#1e40af' }}>
            Calculated totals
          </Typography>
          {totalBasisCalculated != null && (
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>Total purchase and holding costs (basis):</strong> {formatCurrency(totalBasisCalculated)}
            </Typography>
          )}
          {profitLossCalculated != null && (
            <Typography variant="body2">
              <strong>Profit or loss:</strong> {formatCurrency(profitLossCalculated)}
              {profitLossCalculated > 0 ? ' (profit)' : profitLossCalculated < 0 ? ' (loss)' : ''}
            </Typography>
          )}
        </Paper>
      )}

      <FormSection title="Summary and Calculation">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="Total Purchase and Holding costs (basis)"
            value={summary.totalBasis ?? ''}
            onChange={(e) => handleChange('totalBasis', e.target.value)}
            type="number"
            inputProps={{ min: 0, step: 0.01 }}
            fullWidth
            placeholder={totalBasisCalculated != null ? totalBasisCalculated.toString() : ''}
            helperText={totalBasisCalculated != null && (summary.totalBasis === undefined || summary.totalBasis === '') ? `Calculated: ${formatCurrency(totalBasisCalculated)}` : 'Override if needed'}
            InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>$</Typography> }}
          />
          <TextField
            label="Subtract"
            value={summary.subtract ?? ''}
            onChange={(e) => handleChange('subtract', e.target.value)}
            type="number"
            inputProps={{ step: 0.01 }}
            fullWidth
            helperText="Optional deduction from profit"
            InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>$</Typography> }}
          />
          <TextField
            label="Profit or Loss"
            value={summary.profitOrLoss ?? ''}
            onChange={(e) => handleChange('profitOrLoss', e.target.value)}
            type="number"
            inputProps={{ step: 0.01 }}
            fullWidth
            placeholder={profitLossCalculated != null ? profitLossCalculated.toString() : ''}
            helperText={profitLossCalculated != null && (summary.profitOrLoss === undefined || summary.profitOrLoss === '') ? `Calculated: ${formatCurrency(profitLossCalculated)}` : 'Override if needed'}
            InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>$</Typography> }}
          />
        </Box>
      </FormSection>

      {/* Tax treatment note for properties not sold in the same year */}
      <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.200' }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          <strong>Tax treatment note:</strong> If not sold in same year, all purchase and holding costs will be placed in cost of goods sold and will be held there until sold, and then profit/loss accounted for on tax return of year sold.
        </Typography>
      </Paper>
    </Box>
  );
};
