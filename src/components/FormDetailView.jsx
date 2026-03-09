import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  AppBar,
  Toolbar,
  Typography,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { apiService } from '../services/api';
import { downloadFormAsPDF } from '../utils/pdfGenerator';
import { PersonalTaxOrganizerReadOnly } from './personal/PersonalTaxOrganizerReadOnly';
import { BusinessTaxOrganizerReadOnly } from './business/BusinessTaxOrganizerReadOnly';
import { RentalPropertyOrganizerReadOnly } from './rental/RentalPropertyOrganizerReadOnly';
import { FlipOrganizerReadOnly } from './flip/FlipOrganizerReadOnly';

export const FormDetailView = ({ form, onBack, onEdit, userToken, useAdminToken = false, initialFormData = null, hideAppBar = false }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(!initialFormData);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    if (initialFormData) {
      setFormData(initialFormData);
      setLoading(false);
      return;
    }
    loadFormData();
  }, [form.id, initialFormData]);

  const loadFormData = async () => {
    if (initialFormData) return;
    try {
      setLoading(true);
      const response = await apiService.getSubmission(form.id, form.form_type, useAdminToken);
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
      downloadFormAsPDF(formData, form);
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

  const isDrafted = form.status.toLowerCase() === 'draft';
  console.log("form",form)

  return (
    <Box sx={{ flexGrow: 1 }}>
      {!hideAppBar && (
        <AppBar position="static" elevation={0} sx={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
          <Toolbar>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={onBack}
              sx={{ mr: 2, color: '#64748b' }}
            >
              Back to Forms
            </Button>
            <Typography variant="h6" component="div" sx={{ color: '#1e293b', fontWeight: 600, flexGrow: 1 }}>
              {form.form_type.charAt(0).toUpperCase() + form.form_type.slice(1)} Tax Form Details
            </Typography>
            {/* {isDrafted && (
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={handleEdit}
                sx={{ mr: 2 }}
              >
                Edit Form
              </Button>
            )} */}
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadPDF}
            >
              Download PDF
            </Button>
          </Toolbar>
        </AppBar>
      )}

      {/* Render form using structured read-only components */}
      {form.form_type === 'personal' && (
        <PersonalTaxOrganizerReadOnly
          submissionData={formData.submission_data}
          formInfo={form}
          showHeader={true}
        />
      )}
      {form.form_type === 'business' && (
        <BusinessTaxOrganizerReadOnly
          submissionData={formData.submission_data}
          formInfo={form}
          showHeader={true}
        />
      )}
      {form.form_type === 'rental' && (
        <RentalPropertyOrganizerReadOnly
          submissionData={formData.submission_data}
          formInfo={form}
          showHeader={true}
        />
      )}
      {form.form_type === 'flip' && (
        <FlipOrganizerReadOnly
          submissionData={formData.submission_data}
          formInfo={form}
          showHeader={true}
        />
      )}

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