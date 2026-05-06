import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  FormControlLabel, 
  RadioGroup, 
  Radio, 
  FormControl, 
  FormLabel,
  Checkbox,
  FormGroup,
  Typography,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { SecureTextField } from '../../shared/SecureTextField';
import { FormSection } from '../../shared/FormSection';
import { TooltipWrapper } from '../../shared/TooltipWrapper';

export const BusinessBasicInfo = ({ data, onChange }) => {
  const [priorYearUploadDialogOpen, setPriorYearUploadDialogOpen] = useState(false);
  const BUSINESS_DESCRIPTION_MAX_LENGTH = 300;

  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
    if (field === 'firstYear' && value === 'no') {
      setPriorYearUploadDialogOpen(true);
    }
  };

  const handleEntityTypeChange = (type, checked) => {
    const currentTypes = data.entityTypes || {};
    handleChange('entityTypes', {
      ...currentTypes,
      [type]: checked
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <FormSection title="Business Information" isSecure>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Business Name and First Year */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 2, alignItems: 'center' }}>
              <TextField
                label="Business Name"
                value={data.businessName || ''}
                onChange={(e) => handleChange('businessName', e.target.value)}
                required
                fullWidth
              />
              <FormControl component="fieldset">
                <FormLabel component="legend">First year:</FormLabel>
                <RadioGroup
                  row
                  value={data.firstYear || ''}
                  onChange={(e) => handleChange('firstYear', e.target.value)}
                >
                  <FormControlLabel value="yes" control={<Radio />} label="YES" />
                  <FormControlLabel value="no" control={<Radio />} label="NO" />
                </RadioGroup>
              </FormControl>
            </Box>

            {/* Start Date */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <DatePicker
                label="Start Date of Business"
                value={data.startDate ? dayjs(data.startDate) : null}
                onChange={(newValue) => handleChange('startDate', newValue ? newValue.format('YYYY-MM-DD') : null)}
                slotProps={{
                  textField: {
                    fullWidth: true
                  }
                }}
              />
            </Box>

            {/* Business Description */}
            <Box>
              <TextField
                label="Business Description"
                value={data.businessDescriptionText || ''}
                onChange={(e) => handleChange('businessDescriptionText', e.target.value.slice(0, BUSINESS_DESCRIPTION_MAX_LENGTH))}
                fullWidth
                multiline
                minRows={3}
                inputProps={{ maxLength: BUSINESS_DESCRIPTION_MAX_LENGTH }}
                helperText={`${(data.businessDescriptionText || '').length}/${BUSINESS_DESCRIPTION_MAX_LENGTH} characters`}
              />
            </Box>

            {/* Business Address */}
            <TooltipWrapper content="Make sure to put the address that the business is registered under with the Secretary of State">
              <TextField
                label="Business Address"
                value={data.businessAddress || ''}
                onChange={(e) => handleChange('businessAddress', e.target.value)}
                fullWidth
              />
            </TooltipWrapper>

            {/* City, State, Zip, Country */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2 }}>
              <TextField
                label="City"
                value={data.city || ''}
                onChange={(e) => handleChange('city', e.target.value)}
                fullWidth
              />
              <TextField
                label="State"
                value={data.state || ''}
                onChange={(e) => handleChange('state', e.target.value)}
                fullWidth
              />
              <TextField
                label="Zip"
                value={data.zip || ''}
                onChange={(e) => handleChange('zip', e.target.value)}
                fullWidth
              />
              <TextField
                label="Country"
                value={data.country || ''}
                onChange={(e) => handleChange('country', e.target.value)}
                fullWidth
              />
            </Box>

            {/* EIN and State Business Registered In */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <SecureTextField
                label="Employer Identification Number (EIN)"
                value={data.ein || ''}
                onChange={(value) => handleChange('ein', value)}
                type="ein"
                required
              />
              <TextField
                label="State Business Registered In"
                value={data.stateRegistered || ''}
                onChange={(e) => handleChange('stateRegistered', e.target.value)}
                fullWidth
              />
            </Box>

            {/* Type of Entity */}
            <Box>
              <FormControl component="fieldset" fullWidth>
                <FormLabel component="legend">Type of Entity:</FormLabel>
                <FormGroup row sx={{ mt: 1 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={data.entityTypes?.corporation || false}
                        onChange={(e) => handleEntityTypeChange('corporation', e.target.checked)}
                      />
                    }
                    label="Corporation"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={data.entityTypes?.sCorporation || false}
                        onChange={(e) => handleEntityTypeChange('sCorporation', e.target.checked)}
                      />
                    }
                    label="S Corporation"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={data.entityTypes?.singleMemberLLC || false}
                        onChange={(e) => handleEntityTypeChange('singleMemberLLC', e.target.checked)}
                      />
                    }
                    label="Single Member LLC"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={data.entityTypes?.multiMemberLLC || false}
                        onChange={(e) => handleEntityTypeChange('multiMemberLLC', e.target.checked)}
                      />
                    }
                    label="Multi-Member LLC"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={data.entityTypes?.soleProprietor || false}
                        onChange={(e) => handleEntityTypeChange('soleProprietor', e.target.checked)}
                      />
                    }
                    label="Sole Proprietor"
                  />
                </FormGroup>
              </FormControl>
            </Box>

            {/* S Corp Note */}
            <Alert severity="info" sx={{ fontStyle: 'italic' }}>
              <Typography variant="body2">
                <strong>Note:</strong> If this is your first year and you are a S Corp, please attach your filed form 2553. 
                If you have not filed a 2553, you are not considered a S Corp. If you do not know your entity type, 
                please attach the IRS EIN Letter.
              </Typography>
            </Alert>
          </Box>
        </FormSection>
      </Box>
      <Dialog
        open={priorYearUploadDialogOpen}
        onClose={() => setPriorYearUploadDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Prior Year Returns Required</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Since this is not your first year in business, please upload prior year business tax returns to SmartVault.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPriorYearUploadDialogOpen(false)} variant="contained">
            Got it
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};