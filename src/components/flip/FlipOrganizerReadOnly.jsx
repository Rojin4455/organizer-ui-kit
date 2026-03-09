import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Divider,
  Chip,
} from '@mui/material';
import { SwapHoriz as FlipIcon } from '@mui/icons-material';
import { ReadOnlyWrapper } from '../shared/ReadOnlyWrapper';
import { FlipInfo } from './sections/FlipInfo';
import { FlipSalesInfo } from './sections/FlipSalesInfo';
import { FlipPurchaseInfo } from './sections/FlipPurchaseInfo';
import { FlipHoldingCosts } from './sections/FlipHoldingCosts';
import { FlipSummary } from './sections/FlipSummary';

export const FlipOrganizerReadOnly = ({
  submissionData,
  formInfo,
  showHeader = true,
}) => {
  const formData = {
    flipInfo: submissionData?.flipInfo || {},
    salesInfo: submissionData?.salesInfo || {},
    purchaseInfo: submissionData?.purchaseInfo || {},
    holdingCosts: submissionData?.holdingCosts || {},
    summary: submissionData?.summary || {},
  };

  const sections = [
    { id: 'flip-info', title: 'Flip Info', component: <ReadOnlyWrapper readOnly><FlipInfo data={formData.flipInfo} onChange={() => {}} /></ReadOnlyWrapper> },
    { id: 'sales-info', title: 'Sales Information', component: <ReadOnlyWrapper readOnly><FlipSalesInfo data={formData.salesInfo} onChange={() => {}} /></ReadOnlyWrapper> },
    { id: 'purchase-info', title: 'Purchase Information', component: <ReadOnlyWrapper readOnly><FlipPurchaseInfo data={formData.purchaseInfo} onChange={() => {}} /></ReadOnlyWrapper> },
    { id: 'holding-costs', title: 'Holding Costs', component: <ReadOnlyWrapper readOnly><FlipHoldingCosts data={formData.holdingCosts} onChange={() => {}} /></ReadOnlyWrapper> },
    { id: 'summary', title: 'Summary and Calculation', component: <ReadOnlyWrapper readOnly><FlipSummary data={formData} onChange={() => {}} /></ReadOnlyWrapper> },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {showHeader && (
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <FlipIcon sx={{ color: '#06b6d4', fontSize: 32 }} />
            <Typography variant="h4" sx={{ fontWeight: 600, color: '#1e293b' }}>
              Flip Organizer
            </Typography>
            {formInfo?.status && (
              <Chip label={formInfo.status} color={formInfo.status === 'submitted' ? 'success' : 'default'} size="small" />
            )}
          </Box>
          {formInfo?.form_name && (
            <Typography variant="body1" color="text.secondary">
              Form: {formInfo.form_name}
            </Typography>
          )}
        </Box>
      )}

      {sections.map((section, index) => (
        <Box key={section.id} sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', mb: 2 }}>
            {section.title}
          </Typography>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'grey.200', borderRadius: 2 }}>
            {section.component}
          </Paper>
          {index < sections.length - 1 && <Divider sx={{ my: 3 }} />}
        </Box>
      ))}

      <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.200' }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          <strong>Tax treatment note:</strong> If not sold in same year, all purchase and holding costs will be placed in cost of goods sold and will be held there until sold, and then profit/loss accounted for on tax return of year sold.
        </Typography>
      </Paper>
    </Container>
  );
};
