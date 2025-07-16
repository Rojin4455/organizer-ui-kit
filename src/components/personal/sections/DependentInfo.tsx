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

interface DependentInfoProps {
  data: any[];
  onChange: (data: any[]) => void;
}

export const DependentInfo: React.FC<DependentInfoProps> = ({ data = [], onChange }) => {
  const addDependent = () => {
    onChange([...data, {
      id: Date.now(),
      firstName: '',
      lastName: '',
      ssn: '',
      relationship: '',
      dateOfBirth: '',
      monthsLivedWithYou: 12,
      isFullTimeStudent: false,
      childCareExpense: 0,
    }]);
  };

  const removeDependent = (id: number) => {
    onChange(data.filter(dep => dep.id !== id));
  };

  const updateDependent = (id: number, field: string, value: any) => {
    onChange(data.map(dep => 
      dep.id === id ? { ...dep, [field]: value } : dep
    ));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <FormSection title="Dependents (Children & Others)">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Dependents ({data.length})
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

        {data.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: '#f8fafc' }}>
            <Typography color="text.secondary">
              No dependents added yet. Click "Add Dependent" to get started.
            </Typography>
          </Paper>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {data.map((dependent, index) => (
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
    </Box>
  );
};