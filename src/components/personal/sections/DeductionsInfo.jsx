import React, { useState } from 'react';
import {
  Box,
  TextField,
  Typography,
  FormControlLabel,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  TableContainer,
  Button,
} from '@mui/material';
import { FormSection } from '../../shared/FormSection';

export const DeductionsInfo = ({ data, onChange }) => {
  const [charitableTableRows, setCharitableTableRows] = useState(6);
  const [nonCashOrganizations, setNonCashOrganizations] = useState(3);
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  const handleArrayChange = (arrayField, index, field, value) => {
    const array = data[arrayField] || [];
    const newArray = [...array];
    if (!newArray[index]) {
      newArray[index] = {};
    }
    newArray[index][field] = value;
    handleChange(arrayField, newArray);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <FormSection title="Charitable Contributions">
        <FormControlLabel
          control={
            <Checkbox
              checked={data.attachContributionStatements || false}
              onChange={(e) => handleChange('attachContributionStatements', e.target.checked)}
            />
          }
          label="Attach all copies of your Contribution Statements"
        />
        
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6">
              Charitable Contributions Table
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setCharitableTableRows(prev => prev + 1)}
              sx={{ ml: 2 }}
            >
              Add Record
            </Button>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name of Donee Organization</TableCell>
                  <TableCell>Current Year Amount</TableCell>
                  <TableCell>Name of Donee Organization</TableCell>
                  <TableCell>Current Year Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.from({ length: charitableTableRows }, (_, row) => (
                  <TableRow key={row}>
                    <TableCell>
                      <TextField
                        size="small"
                        value={data.charitableOrganizations?.[row * 2]?.name || ''}
                        onChange={(e) => handleArrayChange('charitableOrganizations', row * 2, 'name', e.target.value)}
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={data.charitableOrganizations?.[row * 2]?.amount || ''}
                        onChange={(e) => handleArrayChange('charitableOrganizations', row * 2, 'amount', e.target.value)}
                        InputProps={{ startAdornment: '$' }}
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        value={data.charitableOrganizations?.[row * 2 + 1]?.name || ''}
                        onChange={(e) => handleArrayChange('charitableOrganizations', row * 2 + 1, 'name', e.target.value)}
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={data.charitableOrganizations?.[row * 2 + 1]?.amount || ''}
                        onChange={(e) => handleArrayChange('charitableOrganizations', row * 2 + 1, 'amount', e.target.value)}
                        InputProps={{ startAdornment: '$' }}
                        fullWidth
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mt: 2 }}>
          <TextField
            label="Miles driven for charitable purposes"
            type="number"
            value={data.charitableMiles || ''}
            onChange={(e) => handleChange('charitableMiles', e.target.value)}
            fullWidth
          />
          <TextField
            label="Parking fees, tolls, and local transportation"
            type="number"
            value={data.charitableParkingTolls || ''}
            onChange={(e) => handleChange('charitableParkingTolls', e.target.value)}
            InputProps={{ startAdornment: '$' }}
            fullWidth
          />
        </Box>
      </FormSection>

      <FormSection title="Non-Cash Contributions">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Donee Organization Information
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setNonCashOrganizations(prev => prev + 1)}
            sx={{ ml: 2 }}
          >
            Add Record
          </Button>
        </Box>
        
        {Array.from({ length: nonCashOrganizations }, (_, index) => (
          <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Organization {index + 1}
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2 }}>
              <TextField
                label="Name of Donee Organization"
                value={data.nonCashOrganizations?.[index]?.name || ''}
                onChange={(e) => handleArrayChange('nonCashOrganizations', index, 'name', e.target.value)}
                fullWidth
              />
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                <TextField
                  label="Date of Contribution"
                  type="date"
                  value={data.nonCashOrganizations?.[index]?.dateOfContribution || ''}
                  onChange={(e) => handleArrayChange('nonCashOrganizations', index, 'dateOfContribution', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
                <TextField
                  label="Amount of Contribution"
                  type="number"
                  value={data.nonCashOrganizations?.[index]?.amount || ''}
                  onChange={(e) => handleArrayChange('nonCashOrganizations', index, 'amount', e.target.value)}
                  InputProps={{ startAdornment: '$' }}
                  fullWidth
                />
              </Box>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr 1fr' }, gap: 2 }}>
                <TextField
                  label="Address"
                  value={data.nonCashOrganizations?.[index]?.address || ''}
                  onChange={(e) => handleArrayChange('nonCashOrganizations', index, 'address', e.target.value)}
                  fullWidth
                />
                <TextField
                  label="City"
                  value={data.nonCashOrganizations?.[index]?.city || ''}
                  onChange={(e) => handleArrayChange('nonCashOrganizations', index, 'city', e.target.value)}
                  fullWidth
                />
                <TextField
                  label="State"
                  value={data.nonCashOrganizations?.[index]?.state || ''}
                  onChange={(e) => handleArrayChange('nonCashOrganizations', index, 'state', e.target.value)}
                  fullWidth
                />
                <TextField
                  label="ZIP"
                  value={data.nonCashOrganizations?.[index]?.zip || ''}
                  onChange={(e) => handleArrayChange('nonCashOrganizations', index, 'zip', e.target.value)}
                  fullWidth
                />
              </Box>
              
              <TextField
                label="Description of Donated Property"
                value={data.nonCashOrganizations?.[index]?.description || ''}
                onChange={(e) => handleArrayChange('nonCashOrganizations', index, 'description', e.target.value)}
                multiline
                rows={2}
                fullWidth
              />
            </Box>
          </Box>
        ))}
      </FormSection>

      <FormSection title="General Vehicle Information">
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontWeight: 'bold' }}>
          Do not include self-employment mileage here. This section is for EMPLOYEE business expense only.
        </Typography>
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Vehicle Information</TableCell>
                <TableCell>Vehicle</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>19. Description of vehicle</TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    value={data.vehicleDescription || ''}
                    onChange={(e) => handleChange('vehicleDescription', e.target.value)}
                    fullWidth
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>20. Date placed in service</TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    type="date"
                    value={data.vehicleDatePlacedInService || ''}
                    onChange={(e) => handleChange('vehicleDatePlacedInService', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>21. Total miles for the year</TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    type="number"
                    value={data.vehicleTotalMiles || ''}
                    onChange={(e) => handleChange('vehicleTotalMiles', e.target.value)}
                    fullWidth
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>22. Business miles</TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    type="number"
                    value={data.vehicleBusinessMiles || ''}
                    onChange={(e) => handleChange('vehicleBusinessMiles', e.target.value)}
                    fullWidth
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </FormSection>
    </Box>
  );
};