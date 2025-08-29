import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Button,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  TextField,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
  Business as BusinessIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';

export const ReviewSubmit = ({ data, onChange }) => {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };
  const getSummaryData = () => {
    const summary = {
      taxpayerName: `${data.basicInfo?.firstName || ''} ${data.basicInfo?.lastName || ''}`.trim(),
      hasSpouse: data.basicInfo?.hasSpouse,
      spouseName: data.basicInfo?.hasSpouse ? `${data.basicInfo?.spouseFirstName || ''} ${data.basicInfo?.spouseLastName || ''}`.trim() : null,
      dependentCount: data.dependents?.length || 0,
      filingStatus: data.basicInfo?.filingStatus,
      hasW2: data.income?.hasW2,
      w2Count: data.income?.w2Count || 0,
      hasDirectDeposit: data.taxPayments?.wantsDirectDeposit,
      wantsElectronicFiling: data.taxPayments?.wantsElectronicFiling !== false,
    };
    return summary;
  };

  const summary = getSummaryData();

  const completionItems = [
    {
      label: 'Basic Information',
      completed: Boolean(summary.taxpayerName && data.basicInfo?.ssn && data.basicInfo?.filingStatus),
      icon: <PersonIcon />,
    },
    {
      label: 'Income Information',
      completed: data.income?.hasW2 !== undefined,
      icon: <MoneyIcon />,
    },
    {
      label: 'Tax Payments & Direct Deposit',
      completed: true, // Optional section
      icon: <BusinessIcon />,
    },
  ];

  const completedSections = completionItems.filter(item => item.completed).length;
  const totalSections = completionItems.length;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Paper sx={{ p: 3, backgroundColor: '#f8fafc' }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          Tax Organizer Summary
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Please review your information before submitting
        </Typography>
      </Paper>

      {/* Completion Status */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Completion Status
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {completedSections} of {totalSections} required sections completed
          </Typography>
        </Box>
        
        <List>
          {completionItems.map((item, index) => (
            <ListItem key={index}>
              <ListItemIcon>
                {item.completed ? (
                  <CheckCircleIcon sx={{ color: '#22c55e' }} />
                ) : (
                  <WarningIcon sx={{ color: '#f59e0b' }} />
                )}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                secondary={item.completed ? 'Complete' : 'Incomplete'}
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Taxpayer Summary */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Taxpayer Information
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">Primary Taxpayer</Typography>
            <Typography variant="body1">{summary.taxpayerName || 'Not provided'}</Typography>
          </Box>
          {summary.hasSpouse && (
            <Box>
              <Typography variant="body2" color="text.secondary">Spouse</Typography>
              <Typography variant="body1">{summary.spouseName || 'Not provided'}</Typography>
            </Box>
          )}
          <Box>
            <Typography variant="body2" color="text.secondary">Filing Status</Typography>
            <Typography variant="body1">{summary.filingStatus || 'Not selected'}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">Dependents</Typography>
            <Typography variant="body1">{summary.dependentCount} dependent(s)</Typography>
          </Box>
        </Box>
      </Paper>

      {/* Income Summary */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Income Summary
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {summary.hasW2 && (
            <Chip
              label={`${summary.w2Count} W-2 Form(s)`}
              color="primary"
              variant="outlined"
            />
          )}
          {data.income?.has1099Misc && (
            <Chip
              label="1099-MISC Forms"
              color="primary"
              variant="outlined"
            />
          )}
          {data.income?.has1099Int && (
            <Chip
              label="Interest Income"
              color="primary"
              variant="outlined"
            />
          )}
          {data.income?.has1099Div && (
            <Chip
              label="Dividend Income"
              color="primary"
              variant="outlined"
            />
          )}
          {data.income?.hasCrypto && (
            <Chip
              label="Cryptocurrency"
              color="warning"
              variant="outlined"
            />
          )}
        </Box>
      </Paper>

      {/* Electronic Filing & Direct Deposit */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filing Preferences
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2">Electronic Filing:</Typography>
            <Chip
              label={summary.wantsElectronicFiling ? 'Yes' : 'No'}
              color={summary.wantsElectronicFiling ? 'success' : 'default'}
              size="small"
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2">Direct Deposit:</Typography>
            <Chip
              label={summary.hasDirectDeposit ? 'Yes' : 'No'}
              color={summary.hasDirectDeposit ? 'success' : 'default'}
              size="small"
            />
          </Box>
        </Box>
      </Paper>

      {/* Security Notice */}
      <Alert severity="info" icon={<SecurityIcon />}>
        <Typography variant="body2">
          Your tax information is encrypted and stored securely. All sensitive data (SSN, bank account information) 
          is protected with industry-standard encryption protocols.
        </Typography>
      </Alert>

      {/* Completion Warning */}
      {completedSections < totalSections && (
        <Alert severity="warning">
          <Typography variant="body2">
            Please complete all required sections before submitting your tax organizer.
          </Typography>
        </Alert>
      )}

      {/* Tell us More About Yourself and Notes */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Tell us More About Yourself and Notes
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={6}
          placeholder="Please share any additional information about yourself, your family, business, or tax situation that would be helpful for your tax preparer to know..."
          value={data.personalNotes || ''}
          onChange={(e) => handleChange('personalNotes', e.target.value)}
          variant="outlined"
        />
      </Paper>

      {/* Additional Note */}
      {/* <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Additional Note
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={4}
          placeholder="Any additional notes or comments..."
          value={data.additionalNote || ''}
          onChange={(e) => handleChange('additionalNote', e.target.value)}
          variant="outlined"
        />
      </Paper> */}

      {/* Final Instructions */}
      <Paper sx={{ p: 3, backgroundColor: '#f0f9ff', border: '1px solid #bae6fd' }}>
        <Typography variant="h6" gutterBottom color="primary">
          Next Steps
        </Typography>
        <Typography variant="body2" color="text.secondary">
          1. Review all information above for accuracy
          <br />
          2. Gather and attach all supporting documents
          <br />
          3. Submit your completed tax organizer
          <br />
          4. Your tax preparer will contact you with any questions
        </Typography>
      </Paper>
    </Box>
  );
};