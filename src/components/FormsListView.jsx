import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { apiService } from '../services/api';
import { FormDetailView } from './FormDetailView';
import { downloadFormAsPDF } from '../utils/pdfGenerator';

export const FormsListView = ({ onBack, userToken }) => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedForm, setSelectedForm] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    loadUserForms();
  }, []);

  const loadUserForms = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUserForms();
      setForms(response || []);
    } catch (error) {
      console.error('Error loading forms:', error);
      showNotification('Failed to load forms', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, severity = 'info') => {
    setNotification({ open: true, message, severity });
  };

  const handleViewForm = (form) => {
    setSelectedForm(form);
  };

  const handleEditForm = (formId, formType, formData) => {
    // Navigate to the form edit page with pre-filled data
    const urlParams = new URLSearchParams({
      form_id: formId,
      type: formType
    });
    window.location.href = `/?${urlParams.toString()}`;
  };

  const handleDownloadPDF = async (formId, formType) => {
    try {
      showNotification('Generating PDF...', 'info');
      
      // Get the form data using new endpoint
      const formData = await apiService.getSubmission(formId, formType);
      
      // Generate and download PDF on frontend
      downloadFormAsPDF(formData);
      
      showNotification('PDF downloaded successfully!', 'success');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      showNotification('Failed to download PDF', 'error');
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'submitted':
        return 'success';
      case 'draft':
        return 'warning';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (selectedForm) {
    return (
      <FormDetailView
        form={selectedForm}
        onBack={() => setSelectedForm(null)}
        onEdit={handleEditForm}
        userToken={userToken}
      />
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" elevation={0} sx={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
        <Toolbar>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
            sx={{ mr: 2, color: '#64748b' }}
          >
            Back
          </Button>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: '#1e293b', fontWeight: 600 }}>
            My Tax Forms
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: '#1e293b' }}>
            Your Submitted Forms
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and manage all your tax forms. Click on any form to see details or download as PDF.
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography>Loading forms...</Typography>
          </Box>
        ) : forms.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No forms found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You haven't submitted any tax forms yet.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {forms.map((form) => (
              <Grid item xs={12} md={6} lg={4} key={form.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      {form.form_type === 'Business' ? (
                        <BusinessIcon sx={{ color: '#22c55e', mr: 1 }} />
                      ) : (
                        <PersonIcon sx={{ color: '#3b82f6', mr: 1 }} />
                      )}
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {form.form_type} Tax Form
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Chip
                        label={form.status}
                        color={getStatusColor(form.status)}
                        size="small"
                        sx={{ mb: 1 }}
                      />
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <strong>Submitted:</strong> {formatDate(form.submitted_at)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      <strong>Form ID:</strong> {form.id}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<ViewIcon />}
                        onClick={() => handleViewForm(form)}
                        sx={{ flex: 1 }}
                      >
                        View
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<DownloadIcon />}
                        onClick={() => handleDownloadPDF(form.id, form.form_type)}
                      >
                        PDF
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
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