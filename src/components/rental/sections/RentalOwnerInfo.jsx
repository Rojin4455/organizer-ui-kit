import React from 'react';
import {
  Typography,
  TextField,
  Grid,
  Button,
  Box,
  Paper,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { FormSection } from '../../shared/FormSection';

export const RentalOwnerInfo = ({ data, onChange, onNext, onBack }) => {
  const owners = data.owners || [];

  const handleOwnerChange = (index, field, value) => {
    const newOwners = [...owners];
    newOwners[index] = { ...newOwners[index], [field]: value };
    onChange({ ...data, owners: newOwners });
  };

  const addOwner = () => {
    const newOwner = {
      firstName: '',
      initial: '',
      lastName: '',
      ssn: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      county: '',
      workPhone: '',
      email: '',
      ownershipPercentage: '',
    };
    onChange({ ...data, owners: [...owners, newOwner] });
  };

  const removeOwner = (index) => {
    const newOwners = owners.filter((_, i) => i !== index);
    onChange({ ...data, owners: newOwners });
  };

  return (
    <FormSection
      title="Owner Information"
      onNext={onNext}
      onBack={onBack}
    >
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          *If more than two members please add the additional information in the notes section.
        </Typography>
      </Box>

      {owners.map((owner, index) => (
        <Paper key={index} sx={{ p: 3, mb: 3, bgcolor: 'grey.50' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Owner #{index + 1}</Typography>
            {owners.length > 1 && (
              <IconButton onClick={() => removeOwner(index)} color="error">
                <DeleteIcon />
              </IconButton>
            )}
          </Box>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                label="First Name"
                value={owner.firstName || ''}
                onChange={(e) => handleOwnerChange(index, 'firstName', e.target.value)}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Initial"
                value={owner.initial || ''}
                onChange={(e) => handleOwnerChange(index, 'initial', e.target.value)}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                label="Last Name"
                value={owner.lastName || ''}
                onChange={(e) => handleOwnerChange(index, 'lastName', e.target.value)}
                variant="outlined"
              />
            </Grid>
          </Grid>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="SSN"
                value={owner.ssn || ''}
                onChange={(e) => handleOwnerChange(index, 'ssn', e.target.value)}
                variant="outlined"
                placeholder="XXX-XX-XXXX"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Ownership Percentage (%)"
                value={owner.ownershipPercentage || ''}
                onChange={(e) => handleOwnerChange(index, 'ownershipPercentage', e.target.value)}
                variant="outlined"
                type="number"
              />
            </Grid>
          </Grid>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Address"
                value={owner.address || ''}
                onChange={(e) => handleOwnerChange(index, 'address', e.target.value)}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="City"
                value={owner.city || ''}
                onChange={(e) => handleOwnerChange(index, 'city', e.target.value)}
                variant="outlined"
              />
            </Grid>
          </Grid>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="State"
                value={owner.state || ''}
                onChange={(e) => handleOwnerChange(index, 'state', e.target.value)}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="ZIP"
                value={owner.zip || ''}
                onChange={(e) => handleOwnerChange(index, 'zip', e.target.value)}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="County"
                value={owner.county || ''}
                onChange={(e) => handleOwnerChange(index, 'county', e.target.value)}
                variant="outlined"
              />
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Work Phone"
                value={owner.workPhone || ''}
                onChange={(e) => handleOwnerChange(index, 'workPhone', e.target.value)}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                value={owner.email || ''}
                onChange={(e) => handleOwnerChange(index, 'email', e.target.value)}
                variant="outlined"
                type="email"
              />
            </Grid>
          </Grid>
        </Paper>
      ))}

      <Button
        startIcon={<AddIcon />}
        onClick={addOwner}
        variant="outlined"
        sx={{ mb: 2 }}
      >
        Add Another Owner
      </Button>
    </FormSection>
  );
};