import React from 'react';
import {
  Box,
  TextField,
  Typography,
  Paper,
  Grid,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';

export const ContactInfo = ({ data = {}, onChange }) => {
  const handleChange = (field, value) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  return (
    <Paper elevation={0} sx={{ p: 3, border: '1px solid #e2e8f0' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#1e293b', mb: 1 }}>
          Contact Information
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b' }}>
          Please provide your contact details to get started with your business tax organizer.
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ width: '100%' }}>
        <Grid size={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <PersonIcon sx={{ mr: 1, color: '#22c55e', fontSize: 20 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#374151' }}>
              Full Name *
            </Typography>
          </Box>
          <TextField
            fullWidth
            placeholder="Enter your full name"
            value={data.fullName || ''}
            onChange={(e) => handleChange('fullName', e.target.value)}
            variant="outlined"
            size="medium"
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': { borderColor: '#22c55e' },
                '&.Mui-focused fieldset': { borderColor: '#22c55e' },
              },
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <EmailIcon sx={{ mr: 1, color: '#22c55e', fontSize: 20 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#374151' }}>
              Email Address *
            </Typography>
          </Box>
          <TextField
            fullWidth
            type="email"
            placeholder="Enter your email address"
            value={data.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            variant="outlined"
            size="medium"
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': { borderColor: '#22c55e' },
                '&.Mui-focused fieldset': { borderColor: '#22c55e' },
              },
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <PhoneIcon sx={{ mr: 1, color: '#22c55e', fontSize: 20 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#374151' }}>
              Phone Number *
            </Typography>
          </Box>
          <TextField
            fullWidth
            type="tel"
            placeholder="Enter your phone number"
            value={data.phone || ''}
            onChange={(e) => handleChange('phone', e.target.value)}
            variant="outlined"
            size="medium"
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': { borderColor: '#22c55e' },
                '&.Mui-focused fieldset': { borderColor: '#22c55e' },
              },
            }}
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, p: 2, backgroundColor: '#f8fafc', borderRadius: 1 }}>
        <Typography variant="body2" sx={{ color: '#64748b', fontStyle: 'italic' }}>
          <strong>Note:</strong> This information will be used to create your personalized tax organizer link 
          and for any follow-up communications regarding your business tax preparation.
        </Typography>
      </Box>
    </Paper>
  );
};