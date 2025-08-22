import React from 'react';
import {
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  TextField,
  Grid,
  Divider,
} from '@mui/material';
import { FormSection } from '../../shared/FormSection';

export const GeneralQuestions = ({ data = {}, onChange }) => {
  const handleChange = (field, value) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  const renderYesNoQuestion = (field, question, showDetails = false, detailsField = null) => (
    <Box sx={{ mb: 2 }}>
      <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
        {question}
      </Typography>
      <RadioGroup
        row
        value={data[field] || ''}
        onChange={(e) => handleChange(field, e.target.value)}
      >
        <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
        <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
      </RadioGroup>
      {showDetails && data[field] === 'yes' && detailsField && (
        <TextField
          fullWidth
          size="small"
          placeholder="Please explain..."
          value={data[detailsField] || ''}
          onChange={(e) => handleChange(detailsField, e.target.value)}
          sx={{ mt: 1 }}
        />
      )}
    </Box>
  );

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#1e293b' }}>
        General Questions
      </Typography>

      <FormSection
        title="General Questions"
        isExpanded
        sx={{ mb: 3 }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12}>
            {renderYesNoQuestion(
              'movedResidence',
              'Did you move your residence more than 50 miles due to a change of employment?'
            )}
            {renderYesNoQuestion(
              'soldPrimaryResidence',
              'Did you sell your primary residence in the current year?'
            )}
            {renderYesNoQuestion(
              'foreignIncome',
              'Did you have foreign income or pay any foreign taxes in the current year?'
            )}
          </Grid>
        </Grid>
      </FormSection>
    </Box>
  );
};