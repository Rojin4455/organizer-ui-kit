import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  AppBar,
  Toolbar,
  Divider,
  Grid,
  Paper,
  Chip,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { apiService } from '../services/api';
import { downloadFormAsPDF } from '../utils/pdfGenerator';

export const FormDetailView = ({ form, onBack, onEdit, userToken }) => {
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    loadFormData();
  }, [form.id]);

  const loadFormData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getSubmission(form.id, form.form_type);
      setFormData(response);
    } catch (error) {
      console.error('Error loading form data:', error);
      showNotification('Failed to load form details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, severity = 'info') => {
    setNotification({ open: true, message, severity });
  };

  const handleDownloadPDF = async () => {
    try {
      showNotification('Generating PDF...', 'info');
      downloadFormAsPDF(formData);
      showNotification('PDF downloaded successfully!', 'success');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      showNotification('Failed to download PDF', 'error');
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(form.id, form.form_type, formData);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatValue = (value, section, field) => {
    if (value === null || value === undefined || value === '') {
      return 'Not provided';
    }

    // Handle boolean values
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    // Handle dates
    if (field && (field.includes('date') || field.includes('Date'))) {
      return formatDate(value);
    }

    // Handle arrays and objects
    if (Array.isArray(value)) {
      if (value.length === 0) return 'None';
      return value.map((item, index) => {
        if (typeof item === 'object' && item !== null) {
          return (
            <Box key={index} sx={{ mb: 1, p: 1, bgcolor: '#f8fafc', borderRadius: 1, fontSize: '0.875rem' }}>
              {Object.entries(item).map(([key, val]) => (
                <Typography key={key} variant="body2">
                  <strong>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong> {val || 'Not provided'}
                </Typography>
              ))}
            </Box>
          );
        }
        return `${index + 1}. ${item}`;
      });
    }

    if (typeof value === 'object' && value !== null) {
      return (
        <Box>
          {Object.entries(value).map(([key, val]) => (
            <Typography key={key} variant="body2" sx={{ mb: 0.5 }}>
              <strong>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong> {val || 'Not provided'}
            </Typography>
          ))}
        </Box>
      );
    }

    // Handle numbers with formatting
    if (typeof value === 'number') {
      return value.toLocaleString();
    }

    return String(value);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'submitted':
        return 'success';
      case 'drafted':
        return 'warning';
      default:
        return 'default';
    }
  };

  const renderFormSection = (sectionKey, sectionData, title) => {
    if (!sectionData || Object.keys(sectionData).length === 0) {
      return null;
    }

    return (
      <Card key={sectionKey} sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: '#1e293b' }}>
            {title}
          </Typography>
          
          <Grid container spacing={2}>
            {Object.entries(sectionData).map(([field, value], index) => (
              <Grid item xs={12} md={6} key={field}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 1, color: '#374151' }}>
                    {field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </Typography>
                  <Box sx={{ 
                    p: 2, 
                    bgcolor: '#f9fafb', 
                    borderRadius: 1, 
                    border: '1px solid #e5e7eb',
                    minHeight: '40px',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <Typography variant="body2" sx={{ color: '#111827' }}>
                      {formatValue(value, sectionKey, field)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Typography>Loading form details...</Typography>
      </Box>
    );
  }

  if (!formData) {
    return (
      <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Typography color="error">Failed to load form details</Typography>
      </Box>
    );
  }

  const isDrafted = form.status.toLowerCase() === 'drafted';

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" elevation={0} sx={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
        <Toolbar>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
            sx={{ mr: 2, color: '#64748b' }}
          >
            Back to Forms
          </Button>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            {form.form_type === 'business' ? (
              <BusinessIcon sx={{ color: '#22c55e', mr: 1 }} />
            ) : (
              <PersonIcon sx={{ color: '#3b82f6', mr: 1 }} />
            )}
            <Typography variant="h6" component="div" sx={{ color: '#1e293b', fontWeight: 600 }}>
              {form.form_type.charAt(0).toUpperCase() + form.form_type.slice(1)} Tax Form Details
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          {isDrafted && (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={handleEdit}
              sx={{ mr: 2 }}
            >
              Edit Form
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadPDF}
          >
            Download PDF
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                {form.form_type.charAt(0).toUpperCase() + form.form_type.slice(1)} Tax Form
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Form ID: {form.id}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Chip
                label={form.status.charAt(0).toUpperCase() + form.status.slice(1)}
                color={getStatusColor(form.status)}
                sx={{ mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                Submitted: {formatDate(form.submitted_at)}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Render form data sections */}
        {formData.submission_data && Object.entries(formData.submission_data).map(([sectionKey, sectionData]) => {
          // Skip empty sections
          if (!sectionData || (typeof sectionData === 'object' && Object.keys(sectionData).length === 0)) {
            return null;
          }

          // Generate section title
          const sectionTitle = sectionKey
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .replace(/info/gi, 'Information');

          return renderFormSection(sectionKey, sectionData, sectionTitle);
        })}

        {!formData.submission_data && (
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" align="center">
                No form data available
              </Typography>
            </CardContent>
          </Card>
        )}
      </Container>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert 
          onClose={() => setNotification({ ...notification, open: false })} 
          severity={notification.severity}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};