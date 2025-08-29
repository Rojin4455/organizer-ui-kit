import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardActionArea,
  Grid,
  Chip,
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Person as PersonIcon,
  Business as BusinessIcon,
  Home as HomeIcon,
  AccountBalance as TaxIcon,
  Save as SaveIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { PersonalTaxOrganizer } from './personal/PersonalTaxOrganizer';
import { BusinessTaxOrganizer } from './business/BusinessTaxOrganizer';
import { RentalPropertyOrganizer } from './rental/RentalPropertyOrganizer';
import { FormsListView } from './FormsListView';
import { getUrlParams, setUrlParams, generateFormLink } from '../utils/urlParams';
import { apiService } from '../services/api';
import { businessLogo } from '../assets';
import UserHeader from './UserHeader';


const theme = createTheme({
  palette: {
    primary: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#1d4ed8',
    },
    secondary: {
      main: '#22c55e',
      light: '#4ade80',
      dark: '#15803d',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
    },
  },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    h3: {
      fontWeight: 600,
      color: '#1e293b',
    },
    h4: {
      fontWeight: 600,
      color: '#1e293b',
    },
    h5: {
      fontWeight: 500,
      color: '#1e293b',
    },
    body1: {
      color: '#475569',
    },
    body2: {
      color: '#64748b',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          padding: '8px 24px',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
        },
      },
    },
  },
});

export const TaxOrganizerApp = ({
  onSave,
  initialData = {},
}) => {
  const [selectedOrganizer, setSelectedOrganizer] = useState(null);
  const [savedData, setSavedData] = useState(initialData);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [formId, setFormId] = useState(null);
  const [showFormsList, setShowFormsList] = useState(false);
  const [userToken, setUserToken] = useState(null); // You'll need to get this from your auth system

  // Check URL parameters on component mount
  useEffect(() => {
    const params = getUrlParams();
    if (params.userId && params.formType) {
      setCurrentUserId(params.userId);
      setSelectedOrganizer(params.formType);
      loadFormData(params.userId, params.formType);
    }
    
    // Load existing form data if form_id is provided
    if (params.formId) {
      setFormId(params.formId);
      const resolvedType = params.formType || 'personal';
      setSelectedOrganizer(resolvedType);
      loadExistingFormData(params.formId, resolvedType);
    }
  }, []);
  
  const loadFormData = async (userId, formType) => {
    setIsLoading(true);
    try {
      const response = formType === 'personal' 
        ? await apiService.getPersonalTaxForm(userId)
        : await apiService.getBusinessTaxForm(userId);
      
      // setSavedData(response.data || {});
      
      showNotification('Form data loaded successfully', 'success');
    } catch (error) {
      console.error('Error loading form data:', error);
      showNotification('Failed to load form data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadExistingFormData = async (formId, formType) => {
    setIsLoading(true);
    try {
      const response = await apiService.getSubmission(formId, formType);
      const parsedData = response?.submission_data || {};
      setSavedData(parsedData);
      showNotification('Form data loaded successfully', 'success');
    } catch (error) {
      console.error('Error loading existing form data:', error);
      showNotification('Failed to load form data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (message, severity = 'info') => {
    setNotification({ open: true, message, severity });
  };

  const handleSave = async (data, isCompleted = false) => {
    console.log("saved Data Before: ", data)
    try {
      setIsLoading(true);
      
      // Build payload with simplified structure
      const payload = { form_type: selectedOrganizer || 'personal', status: isCompleted ? 'submitted' : 'drafted', ...data };
      
      // Generate PDF if form is being completed
      let pdfBase64 = null;
      if (isCompleted) {
        try {
          const { generatePDFFromFormData } = await import('../utils/pdfGenerator');
          const formInfo = {
            form_type: selectedOrganizer || 'personal',
            id: formId || 'new',
            status: 'submitted',
            submitted_at: new Date().toISOString()
          };
          
          const doc = generatePDFFromFormData({ submission_data: data }, formInfo);
          pdfBase64 = doc.output('datauristring').split(',')[1]; // Get base64 without data URI prefix
          
          // Add PDF to payload
          payload.pdf_data = pdfBase64;
        } catch (pdfError) {
          console.warn('Failed to generate PDF:', pdfError);
          // Continue with form submission even if PDF generation fails
        }
      }
      
      // Create or update submission
      const response = formId
        ? await apiService.updateTaxFormSubmission(formId, payload.form_type, payload)
        : await apiService.createTaxFormSubmission(payload);

        console.log("form Iddddd: ", formId)

      console.log("saved Data: ", data)
      
      // Update local state with saved data
      setSavedData(data);
      onSave?.(data);
      
      // Store form ID for subsequent saves
      if (response.id && !formId) {
        setFormId(response.id);
        // Update URL with form_id
        setUrlParams({ 
          type: selectedOrganizer, 
          form_id: response.id 
        });
      }

      // Refresh form data from server to ensure consistency
      if (formId || response.id) {
        const finalFormId = formId || response.id;
        try {
          const serverResponse = await apiService.getSubmission(finalFormId, selectedOrganizer || 'personal');
          const parsedData = serverResponse?.submission_data || {};
          setSavedData(parsedData);
        } catch (refreshError) {
          console.warn('Failed to refresh form data after save:', refreshError);
        }
      }

      // Save to localStorage as backup
      localStorage.setItem('taxOrganizerData', JSON.stringify(data));
      
      showNotification(
        isCompleted ? 'Form submitted successfully!' : 'Progress saved successfully!', 
        'success'
      );

      // Generate shareable link if completed
      if (isCompleted && (formId || response.id)) {
        const finalFormId = formId || response.id;
        const formLink = generateFormLink(finalFormId, selectedOrganizer, 'view');
        console.log('Shareable form link:', formLink);
      }

      return response;
    } catch (error) {
      console.error('Error saving form:', error);
      showNotification('Failed to save form. Please try again.', 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedOrganizer(null);
    setSavedData({});
    setCurrentUserId(null);
    setUrlParams({ userId: null, type: null });
    localStorage.removeItem('taxOrganizerData');
    showNotification('Form reset successfully', 'info');
  };

  const handleNewForm = (formType) => {
    setSelectedOrganizer(formType);
    setCurrentUserId(null);
    setSavedData({});
    setFormId(null);
    setUrlParams({ type: formType, userId: null, form_id: null });
  };

  if (showFormsList) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <FormsListView
          onBack={() => setShowFormsList(false)}
          userToken={userToken}
        />
      </ThemeProvider>
    );
  }

  if (selectedOrganizer === 'personal') {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <PersonalTaxOrganizer
          onSave={handleSave}
          onBack={() => setSelectedOrganizer(null)}
          initialData={savedData}
          userId={currentUserId}
          isLoading={isLoading}
        />
      </ThemeProvider>
    );
  }

  if (selectedOrganizer === 'business') {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BusinessTaxOrganizer
          onSave={handleSave}
          onBack={() => setSelectedOrganizer(null)}
          initialData={savedData}
          userId={currentUserId}
          isLoading={isLoading}
        />
      </ThemeProvider>
    );
  }

  if (selectedOrganizer === 'rental') {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RentalPropertyOrganizer
          onSave={handleSave}
          onBack={() => setSelectedOrganizer(null)}
          initialData={savedData}
          userId={currentUserId}
          isLoading={isLoading}
        />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <UserHeader />
        <AppBar position="static" elevation={0} sx={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
          <Toolbar>
            <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
              <img 
                src={businessLogo} 
                alt="Business Logo" 
                style={{ height: '40px', width: 'auto' }}
              />
            </Box>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: '#1e293b', fontWeight: 600 }}>
              Tax Organizer Pro
            </Typography>
            <Button
              variant="outlined"
              startIcon={<SaveIcon />}
              onClick={() => setShowFormsList(true)}
              sx={{ mr: 1 }}
            >
              My Forms
            </Button>
            {/* <Button
              variant="outlined"
              startIcon={<SaveIcon />}
              onClick={() => {
                const data = localStorage.getItem('taxOrganizerData');
                if (data) {
                  const blob = new Blob([data], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'tax-organizer-data.json';
                  a.click();
                }
              }}
              sx={{ mr: 1 }}
            >
              Export Data
            </Button> */}
            <IconButton
              color="inherit"
              onClick={handleReset}
              sx={{ color: '#64748b' }}
            >
              <SettingsIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
              Professional Tax Organizer
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
              Streamline your tax preparation with our comprehensive, user-friendly organizer. 
              Choose between personal or business tax organization.
            </Typography>
            <Chip
              label="Secure & Encrypted"
              color="primary"
              variant="outlined"
              sx={{ mr: 1 }}
            />
            <Chip
              label="Save & Resume"
              color="secondary"
              variant="outlined"
              sx={{ mr: 1 }}
            />
            <Chip
              label="Professional Grade"
              color="primary"
              variant="outlined"
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Card sx={{ width: { xs: '100%', md: '400px' }, height: '100%' }}>
              <CardActionArea
                onClick={() => handleNewForm('personal')}
                sx={{ height: '100%', p: 3 }}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <PersonIcon sx={{ fontSize: 64, color: '#3b82f6', mb: 2 }} />
                  <Typography variant="h4" component="h2" gutterBottom>
                    Personal Tax Organizer
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Complete your personal tax information including income, deductions, 
                    dependents, and more.
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                    <Chip size="small" label="W-2 Forms" variant="outlined" />
                    <Chip size="small" label="Deductions" variant="outlined" />
                    <Chip size="small" label="Dependents" variant="outlined" />
                    <Chip size="small" label="Investments" variant="outlined" />
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>

            <Card sx={{ width: { xs: '100%', md: '400px' }, height: '100%' }}>
              <CardActionArea
                onClick={() => handleNewForm('business')}
                sx={{ height: '100%', p: 3 }}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <BusinessIcon sx={{ fontSize: 64, color: '#22c55e', mb: 2 }} />
                  <Typography variant="h4" component="h2" gutterBottom>
                    Business Tax Organizer
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Organize your business tax information including income, expenses, 
                    assets, and entity details.
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                    <Chip size="small" label="Business Income" variant="outlined" />
                    <Chip size="small" label="Expenses" variant="outlined" />
                    <Chip size="small" label="Assets" variant="outlined" />
                    <Chip size="small" label="Entity Info" variant="outlined" />
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>

            <Card sx={{ width: { xs: '100%', md: '400px' }, height: '100%' }}>
              <CardActionArea
                onClick={() => handleNewForm('rental')}
                sx={{ height: '100%', p: 3 }}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <HomeIcon sx={{ fontSize: 64, color: '#f59e0b', mb: 2 }} />
                  <Typography variant="h4" component="h2" gutterBottom>
                    Rental Property Organizer
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Organize your rental property information including property details, 
                    income, expenses, and owner information.
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                    <Chip size="small" label="Property Info" variant="outlined" />
                    <Chip size="small" label="Rental Income" variant="outlined" />
                    <Chip size="small" label="Expenses" variant="outlined" />
                    <Chip size="small" label="Owner Details" variant="outlined" />
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Box>

          <Box sx={{ mt: 6, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              All data is encrypted and stored securely. Your information is never shared with third parties.
            </Typography>
          </Box>
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
    </ThemeProvider>
  );
};