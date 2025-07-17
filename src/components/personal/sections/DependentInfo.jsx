import React from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  Paper,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { SecureTextField } from '../../shared/SecureTextField';
import { FormSection } from '../../shared/FormSection';

export const DependentInfo = ({ data = [], onChange }) => {
  // Split data into dependents and care expenses
  const dependents = data.dependents || [];
  const careExpenses = data.careExpenses || [];

  const addDependent = () => {
    const newDependents = [...dependents, {
      id: Date.now(),
      firstName: '',
      lastName: '',
      ssn: '',
      relationship: '',
      dateOfBirth: '',
      monthsLivedWithYou: 12,
      isFullTimeStudent: false,
      childCareExpense: 0,
    }];
    onChange({ ...data, dependents: newDependents });
  };

  const addCareExpense = () => {
    const newCareExpenses = [...careExpenses, {
      id: Date.now(),
      name: '',
      address: '',
      einOrSsn: '',
      amountPaid: 0,
      child: '',
    }];
    onChange({ ...data, careExpenses: newCareExpenses });
  };

  const removeDependent = (id) => {
    const newDependents = dependents.filter(dep => dep.id !== id);
    onChange({ ...data, dependents: newDependents });
  };

  const removeCareExpense = (id) => {
    const newCareExpenses = careExpenses.filter(exp => exp.id !== id);
    onChange({ ...data, careExpenses: newCareExpenses });
  };

  const updateDependent = (id, field, value) => {
    const newDependents = dependents.map(dep => 
      dep.id === id ? { ...dep, [field]: value } : dep
    );
    onChange({ ...data, dependents: newDependents });
  };

  const updateCareExpense = (id, field, value) => {
    const newCareExpenses = careExpenses.map(exp => 
      exp.id === id ? { ...exp, [field]: value } : exp
    );
    onChange({ ...data, careExpenses: newCareExpenses });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <FormSection title="Dependents (Children & Others)">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Dependents ({dependents.length})
          </Typography>
          <Button
            startIcon={<AddIcon />}
            onClick={addDependent}
            variant="contained"
            size="small"
          >
            Add Dependent
          </Button>
        </Box>

        {dependents.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: '#f8fafc' }}>
            <Typography color="text.secondary">
              No dependents added yet. Click "Add Dependent" to get started.
            </Typography>
          </Paper>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {dependents.map((dependent, index) => (
              <Paper key={dependent.id} sx={{ p: 3, border: '1px solid #e2e8f0' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Dependent #{index + 1}
                  </Typography>
                  <IconButton
                    onClick={() => removeDependent(dependent.id)}
                    color="error"
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
                  <TextField
                    label="First Name"
                    value={dependent.firstName || ''}
                    onChange={(e) => updateDependent(dependent.id, 'firstName', e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="Last Name"
                    value={dependent.lastName || ''}
                    onChange={(e) => updateDependent(dependent.id, 'lastName', e.target.value)}
                    fullWidth
                  />
                  <SecureTextField
                    label="Social Security Number"
                    value={dependent.ssn || ''}
                    onChange={(value) => updateDependent(dependent.id, 'ssn', value)}
                    type="ssn"
                  />
                  <TextField
                    label="Relationship"
                    value={dependent.relationship || ''}
                    onChange={(e) => updateDependent(dependent.id, 'relationship', e.target.value)}
                    placeholder="Son, Daughter, etc."
                    fullWidth
                  />
                  <TextField
                    label="Date of Birth"
                    type="date"
                    value={dependent.dateOfBirth || ''}
                    onChange={(e) => updateDependent(dependent.id, 'dateOfBirth', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                  <TextField
                    label="Months Lived With You"
                    type="number"
                    value={dependent.monthsLivedWithYou || 12}
                    onChange={(e) => updateDependent(dependent.id, 'monthsLivedWithYou', parseInt(e.target.value))}
                    inputProps={{ min: 0, max: 12 }}
                    fullWidth
                  />
                  <TextField
                    label="Child Care Expense"
                    type="number"
                    value={dependent.childCareExpense || 0}
                    onChange={(e) => updateDependent(dependent.id, 'childCareExpense', parseFloat(e.target.value))}
                    inputProps={{ min: 0, step: 0.01 }}
                    InputProps={{ startAdornment: '$' }}
                    fullWidth
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={dependent.isFullTimeStudent || false}
                          onChange={(e) => updateDependent(dependent.id, 'isFullTimeStudent', e.target.checked)}
                        />
                      }
                      label="Full Time Student"
                    />
                  </Box>
                </Box>
              </Paper>
            ))}
          </Box>
        )}
      </FormSection>

      <FormSection title="Child and Dependent Care Expenses">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Care Expenses ({careExpenses.length})
          </Typography>
          <Button
            startIcon={<AddIcon />}
            onClick={addCareExpense}
            variant="contained"
            size="small"
          >
            Add Care Expense
          </Button>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Enter below the persons or organizations who provided the child and dependent care.
        </Typography>

        {careExpenses.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: '#f8fafc' }}>
            <Typography color="text.secondary">
              No care expenses added yet. Click "Add Care Expense" to get started.
            </Typography>
          </Paper>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {careExpenses.map((expense, index) => (
              <Paper key={expense.id} sx={{ p: 3, border: '1px solid #e2e8f0' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Care Provider #{index + 1}
                  </Typography>
                  <IconButton
                    onClick={() => removeCareExpense(expense.id)}
                    color="error"
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                  <TextField
                    label="Name"
                    value={expense.name || ''}
                    onChange={(e) => updateCareExpense(expense.id, 'name', e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="Address"
                    value={expense.address || ''}
                    onChange={(e) => updateCareExpense(expense.id, 'address', e.target.value)}
                    fullWidth
                  />
                  <SecureTextField
                    label="EIN or Social Security Number"
                    value={expense.einOrSsn || ''}
                    onChange={(value) => updateCareExpense(expense.id, 'einOrSsn', value)}
                    type="ssn"
                  />
                  <TextField
                    label="Amount Paid"
                    type="number"
                    value={expense.amountPaid || 0}
                    onChange={(e) => updateCareExpense(expense.id, 'amountPaid', parseFloat(e.target.value))}
                    inputProps={{ min: 0, step: 0.01 }}
                    InputProps={{ startAdornment: '$' }}
                    fullWidth
                  />
                  <TextField
                    label="Child"
                    value={expense.child || ''}
                    onChange={(e) => updateCareExpense(expense.id, 'child', e.target.value)}
                    placeholder="Name of child who received care"
                    fullWidth
                    sx={{ gridColumn: { md: '1 / -1' } }}
                  />
                </Box>
              </Paper>
            ))}
          </Box>
        )}
      </FormSection>
    </Box>
  );
};