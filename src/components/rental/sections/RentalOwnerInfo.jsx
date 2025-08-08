import React from 'react';
import {
  Box,
  TextField,
  Typography,
  Button,
  Paper,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { SecureTextField } from '../../shared/SecureTextField';
import { FormSection } from '../../shared/FormSection';

export const RentalOwnerInfo = ({ data, onChange }) => {
  const owners = data.owners || [{}];

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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <FormSection title="Owner Information" isSecure>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            *If more than two members please add the additional information in the notes section.
          </Typography>

          {owners.map((owner, index) => (
            <Paper key={index} sx={{ p: 3, bgcolor: 'grey.50', border: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Owner #{index + 1}</Typography>
                {owners.length > 1 && (
                  <IconButton onClick={() => removeOwner(index)} color="error">
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 2fr' }, gap: 2 }}>
                  <TextField
                    label="First Name"
                    value={owner.firstName || ''}
                    onChange={(e) => handleOwnerChange(index, 'firstName', e.target.value)}
                    fullWidth
                    required
                  />
                  <TextField
                    label="Initial"
                    value={owner.initial || ''}
                    onChange={(e) => handleOwnerChange(index, 'initial', e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="Last Name"
                    value={owner.lastName || ''}
                    onChange={(e) => handleOwnerChange(index, 'lastName', e.target.value)}
                    fullWidth
                    required
                  />
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                  <SecureTextField
                    label="Social Security Number"
                    value={owner.ssn || ''}
                    onChange={(value) => handleOwnerChange(index, 'ssn', value)}
                    type="ssn"
                    required
                  />
                  <TextField
                    label="Ownership Percentage (%)"
                    value={owner.ownershipPercentage || ''}
                    onChange={(e) => handleOwnerChange(index, 'ownershipPercentage', e.target.value)}
                    type="number"
                    inputProps={{ min: 0, max: 100 }}
                    fullWidth
                  />
                </Box>

                <TextField
                  label="Address"
                  value={owner.address || ''}
                  onChange={(e) => handleOwnerChange(index, 'address', e.target.value)}
                  fullWidth
                />

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
                  <TextField
                    label="City"
                    value={owner.city || ''}
                    onChange={(e) => handleOwnerChange(index, 'city', e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="State"
                    value={owner.state || ''}
                    onChange={(e) => handleOwnerChange(index, 'state', e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="ZIP"
                    value={owner.zip || ''}
                    onChange={(e) => handleOwnerChange(index, 'zip', e.target.value)}
                    fullWidth
                  />
                </Box>

                <TextField
                  label="County"
                  value={owner.county || ''}
                  onChange={(e) => handleOwnerChange(index, 'county', e.target.value)}
                  fullWidth
                />

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                  <TextField
                    label="Work Phone"
                    value={owner.workPhone || ''}
                    onChange={(e) => handleOwnerChange(index, 'workPhone', e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="Email"
                    value={owner.email || ''}
                    onChange={(e) => handleOwnerChange(index, 'email', e.target.value)}
                    type="email"
                    fullWidth
                  />
                </Box>
              </Box>
            </Paper>
          ))}

          <Button
            startIcon={<AddIcon />}
            onClick={addOwner}
            variant="outlined"
            sx={{ alignSelf: 'flex-start' }}
          >
            Add Another Owner
          </Button>
        </Box>
      </FormSection>
    </Box>
  );
};