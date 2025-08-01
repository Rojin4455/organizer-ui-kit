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
  Business as BusinessIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { apiService } from '../services/api';

export const FormDetailView = ({ form, onBack, onDownloadPDF, userToken }) => {
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    loadFormData();
  }, [form.id]);

  const loadFormData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getFormData(form.id);
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

  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatAnswer = (answer, fieldType) => {
    if (answer === null || answer === undefined || answer === '') {
      return 'Not provided';
    }

    switch (fieldType) {
      case 'boolean':
        return answer ? 'Yes' : 'No';
      case 'date':
        return formatDate(answer);
      case 'json':
        if (typeof answer === 'string') {
          try {
            const parsed = JSON.parse(answer);
            if (Array.isArray(parsed)) {
              return parsed.filter(item => item && Object.keys(item).length > 0)
                .map((item, index) => (
                  <Box key={index} sx={{ mb: 1, p: 1, bgcolor: '#f8fafc', borderRadius: 1 }}>
                    {Object.entries(item).map(([key, value]) => (
                      <Typography key={key} variant="body2" sx={{ fontSize: '0.875rem' }}>
                        <strong>{key}:</strong> {value || 'Not provided'}
                      </Typography>
                    ))}
                  </Box>
                ));
            } else if (typeof parsed === 'object') {
              return Object.entries(parsed)
                .filter(([key, value]) => value === true)
                .map(([key]) => key)
                .join(', ') || 'None selected';
            }
          } catch (e) {
            return answer;
          }
        }
        return Array.isArray(answer) ? answer.join(', ') : String(answer);
      case 'signature':
        if (typeof answer === 'string') {
          try {
            const parsed = JSON.parse(answer);
            return (
              <Box>
                {parsed.taxpayerSignature && (
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2"><strong>Taxpayer Signature:</strong> Provided</Typography>
                    <Typography variant="body2"><strong>Date:</strong> {formatDate(parsed.taxpayerDate)}</Typography>
                  </Box>
                )}
                {parsed.partnerSignature && (
                  <Box>
                    <Typography variant="body2"><strong>Partner Signature:</strong> Provided</Typography>
                    <Typography variant="body2"><strong>Date:</strong> {formatDate(parsed.partnerDate)}</Typography>
                  </Box>
                )}
              </Box>
            );
          } catch (e) {
            return 'Signature provided';
          }
        }
        return 'Signature provided';
      case 'encrypted':
        return '••••••••••• (Encrypted)';
      case 'number':
        return typeof answer === 'number' ? answer.toLocaleString() : answer;
      default:
        return String(answer);
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
            {form.form_type === 'Business' ? (
              <BusinessIcon sx={{ color: '#22c55e', mr: 1 }} />
            ) : (
              <PersonIcon sx={{ color: '#3b82f6', mr: 1 }} />
            )}
            <Typography variant="h6" component="div" sx={{ color: '#1e293b', fontWeight: 600 }}>
              {form.form_type} Tax Form Details
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={onDownloadPDF}
            sx={{ ml: 2 }}
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
                {form.form_type} Tax Form
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Form ID: {form.id}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Chip
                label={form.status}
                color={getStatusColor(form.status)}
                sx={{ mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                Submitted: {formatDate(form.submission_date)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Created: {formatDate(form.created_at)}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {formData.sections && formData.sections.map((section, sectionIndex) => (
          <Card key={section.section_key} sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: '#1e293b' }}>
                {section.title}
              </Typography>
              
              {section.questions.map((question, questionIndex) => (
                <Box key={questionIndex} sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 500, mb: 1, color: '#374151' }}>
                    {question.question}
                  </Typography>
                  <Box sx={{ pl: 2, py: 1, bgcolor: '#f9fafb', borderRadius: 1, border: '1px solid #e5e7eb' }}>
                    <Typography variant="body1" sx={{ color: '#111827' }}>
                      {formatAnswer(question.answer, question.field_type)}
                    </Typography>
                  </Box>
                  {questionIndex < section.questions.length - 1 && (
                    <Divider sx={{ mt: 2 }} />
                  )}
                </Box>
              ))}
            </CardContent>
          </Card>
        ))}

        {formData.business_owners && formData.business_owners.length > 0 && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: '#1e293b' }}>
                Business Owners Summary
              </Typography>
              {formData.business_owners.map((owner, index) => (
                <Box key={index} sx={{ mb: 2, p: 2, bgcolor: '#f8fafc', borderRadius: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 500 }}>
                    {owner.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ownership: {owner.ownership_percentage}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Address: {owner.address}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Phone: {owner.phone}
                  </Typography>
                </Box>
              ))}
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