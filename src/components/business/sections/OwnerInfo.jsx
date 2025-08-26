import React from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  IconButton,
  Alert,
  Divider
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { SecureTextField } from '../../shared/SecureTextField';
import { FormSection } from '../../shared/FormSection';

export const OwnerInfo = ({ data, onChange }) => {
  const owners = data.owners || [{}];

  const handleOwnerChange = (index, field, value) => {
    const updatedOwners = [...owners];
    updatedOwners[index] = { ...updatedOwners[index], [field]: value };
    onChange({ ...data, owners: updatedOwners });
  };

  const addOwner = () => {
    const updatedOwners = [...owners, {}];
    onChange({ ...data, owners: updatedOwners });
  };

  const removeOwner = (index) => {
    if (owners.length > 1) {
      const updatedOwners = owners.filter((_, i) => i !== index);
      onChange({ ...data, owners: updatedOwners });
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <FormSection title="Owner Information" isSecure>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Typography variant="body2" sx={{ fontStyle: 'italic', mb: 2 }}>
            (If same as taxpayers, simply insert names)
          </Typography>

          {owners.map((owner, index) => (
            <Box key={index}>
              {index > 0 && <Divider sx={{ my: 3 }} />}
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Owner {index + 1}
                </Typography>
                {owners.length > 1 && (
                  <IconButton 
                    onClick={() => removeOwner(index)}
                    color="error"
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Name Fields */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 0.5fr 2fr' }, gap: 2 }}>
                  <TextField
                    label="First Name"
                    value={owner.firstName || ''}
                    onChange={(e) => handleOwnerChange(index, 'firstName', e.target.value)}
                    fullWidth
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
                  />
                </Box>

                {/* SSN */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                  <SecureTextField
                    label="SSN#"
                    value={owner.ssn || ''}
                    onChange={(value) => handleOwnerChange(index, 'ssn', value)}
                    type="ssn"
                  />
                </Box>

                {/* Address and City */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 2 }}>
                  <TextField
                    label="Address"
                    value={owner.address || ''}
                    onChange={(e) => handleOwnerChange(index, 'address', e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="City"
                    value={owner.city || ''}
                    onChange={(e) => handleOwnerChange(index, 'city', e.target.value)}
                    fullWidth
                  />
                </Box>

                {/* State, Zip, Country */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
                  <TextField
                    label="State"
                    value={owner.state || ''}
                    onChange={(e) => handleOwnerChange(index, 'state', e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="Zip"
                    value={owner.zip || ''}
                    onChange={(e) => handleOwnerChange(index, 'zip', e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="Country"
                    value={owner.country || ''}
                    onChange={(e) => handleOwnerChange(index, 'country', e.target.value)}
                    fullWidth
                  />
                </Box>

                {/* Work Tel, Email, and Ownership Percentage */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
                  <TextField
                    label="Work Tel"
                    value={owner.workTel || ''}
                    onChange={(e) => handleOwnerChange(index, 'workTel', e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="Email Address"
                    value={owner.email || ''}
                    onChange={(e) => handleOwnerChange(index, 'email', e.target.value)}
                    type="email"
                    fullWidth
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
              </Box>
            </Box>
          ))}

          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={addOwner}
            sx={{ alignSelf: 'flex-start', mt: 2 }}
          >
            Add Owner
          </Button>

          <Alert severity="info" sx={{ fontStyle: 'italic', mt: 2 }}>
            <Typography variant="body2">
              *If more than two owners please include additional information in the notes section
            </Typography>
          </Alert>
        </Box>
      </FormSection>
    </Box>
  );
};