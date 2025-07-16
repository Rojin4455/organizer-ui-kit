import React from 'react';
import { Box, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { SecureTextField } from '../../shared/SecureTextField';
import { FormSection } from '../../shared/FormSection';

interface BusinessBasicInfoProps {
  data: any;
  onChange: (data: any) => void;
}

export const BusinessBasicInfo: React.FC<BusinessBasicInfoProps> = ({ data, onChange }) => {
  const handleChange = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <FormSection title="Business Information" isSecure>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <TextField
            label="Business Name"
            value={data.businessName || ''}
            onChange={(e) => handleChange('businessName', e.target.value)}
            required
            fullWidth
          />
          <SecureTextField
            label="EIN (Employer ID Number)"
            value={data.ein || ''}
            onChange={(value) => handleChange('ein', value)}
            type="ein"
            required
          />
          <FormControl fullWidth>
            <InputLabel>Entity Type</InputLabel>
            <Select
              value={data.entityType || ''}
              onChange={(e) => handleChange('entityType', e.target.value)}
              label="Entity Type"
            >
              <MenuItem value="soleProprietor">Sole Proprietor</MenuItem>
              <MenuItem value="singleMemberLLC">Single Member LLC</MenuItem>
              <MenuItem value="multiMemberLLC">Multi-Member LLC</MenuItem>
              <MenuItem value="corporation">Corporation</MenuItem>
              <MenuItem value="sCorporation">S Corporation</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Business Description"
            value={data.businessDescription || ''}
            onChange={(e) => handleChange('businessDescription', e.target.value)}
            fullWidth
          />
        </Box>
      </FormSection>
    </Box>
  );
};