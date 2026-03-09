import React, { useState, useEffect } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Switch,
  FormControlLabel,
  Alert,
  Chip,
  IconButton,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Home as HomeIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { FormStepper } from '../shared/FormStepper';
import { RentalEntityInfo } from './sections/RentalEntityInfo';
import { RentalOwnerInfo } from './sections/RentalOwnerInfo';
import { RentalPropertyInfo } from './sections/RentalPropertyInfo';
import { RentalIncomeExpenses } from './sections/RentalIncomeExpenses';
import { RentalReview } from './sections/RentalReview';
import { apiService } from '../../services/api';
import { ReadOnlyWrapper } from '../shared/ReadOnlyWrapper';

const createDefaultFormData = () => ({
  entityInfo: {},
  ownerInfo: {},
  propertyInfo: {},
  incomeExpenses: {},
  notes: {},
});

const createDefaultFormTab = (index = 0) => ({
  id: `rental_${Date.now()}_${index}`,
  name: `Rental Property ${index + 1}`,
  formData: createDefaultFormData(),
  activeStep: 0,
  submissionId: null,
  status: 'draft',
  isDataLoaded: false,
});

/** Tab label: use entity Business Name from form when set, otherwise "Rental Property 1", "Rental Property 2", etc. */
const getTabDisplayName = (tab, index) => {
  const name = tab?.formData?.entityInfo?.businessName?.trim();
  if (name) return name;
  const i = index ?? 0;
  if (tab?.name && /^Rental Property \d{10,}$/.test(tab.name)) return `Rental Property ${i + 1}`;
  return tab?.name || `Rental Property ${i + 1}`;
};

export const RentalPropertyOrganizer = ({
  onSave,
  onBack,
  initialData = {},
  userId,
  isLoading = false,
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useVerticalStepper, setUseVerticalStepper] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // Tab management state
  const [formTabs, setFormTabs] = useState([]);
  const [activeTabId, setActiveTabId] = useState('');
  const [editingTabId, setEditingTabId] = useState(null);
  const [editingTabName, setEditingTabName] = useState('');
  const [tabToDelete, setTabToDelete] = useState(null);

  // Load existing submissions from backend on mount
  useEffect(() => {
    loadExistingSubmissions();
  }, []);

  const loadExistingSubmissions = async () => {
    setIsLoadingData(true);
    try {
      console.log('Loading rental submissions...');
      const response = await apiService.getFormSubmissionsByType('rental');
      console.log('Rental submissions response:', response);
      
      if (response && Array.isArray(response) && response.length > 0) {
        // Create tabs from existing submissions
        const tabs = response.map((submission, idx) => ({
          id: submission.id,
          name: submission.form_name || `Rental Property ${idx + 1}`,
          formData: createDefaultFormData(),
          activeStep: 0,
          submissionId: submission.id,
          status: submission.status,
          isDataLoaded: false,
        }));
        
        setFormTabs(tabs);
        setActiveTabId(tabs[0].id);
        
        // Load all tabs' data in parallel so every tab shows its name (entity Business Name) on initial load
        const results = await Promise.allSettled(
          tabs.map((tab) => apiService.getSubmission(tab.id, 'rental'))
        );
        const mergedTabs = tabs.map((tab, i) => {
          const res = results[i];
          if (res.status !== 'fulfilled' || !res.value?.submission_data) return tab;
          const sd = res.value.submission_data;
          const nameFromForm = sd.entityInfo?.businessName?.trim() || sd._metadata?.tab_name || undefined;
          return {
            ...tab,
            formData: {
              entityInfo: sd.entityInfo || {},
              ownerInfo: sd.ownerInfo || {},
              propertyInfo: sd.propertyInfo || {},
              incomeExpenses: sd.incomeExpenses || {},
              notes: sd.notes || {},
            },
            isDataLoaded: true,
            name: nameFromForm || tab.name,
          };
        });
        setFormTabs(mergedTabs);
      } else {
        console.log('No existing submissions, creating default tab');
        // Create empty draft on backend
        await createEmptyDraft();
      }
    } catch (error) {
      console.error('Error loading submissions:', error);
      
      // Check if it's an authentication error
      if (error.status === 401 || error.message?.includes('401') || error.message?.includes('expired') || error.message?.includes('session')) {
        toast({
          title: "Session Expired",
          description: "Your session has expired. Redirecting to login...",
          variant: "destructive",
        });
        // Redirect will be handled by API service, but add a delay for user to see the message
        setTimeout(() => {
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }, 2000);
        return;
      }
      
      // Check if it's a network error
      if (error.message?.includes('Failed to fetch') || error.message?.includes('Network') || error.message?.includes('network')) {
        toast({
          title: "Network Error",
          description: "Unable to connect to the server. Please check your internet connection and try again.",
          variant: "destructive",
        });
        return;
      }
      
      // Generic error with more details
      const errorMessage = error.message || error.responseData?.detail || 'Unknown error occurred';
      toast({
        title: "Error",
        description: `Failed to load existing forms: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadTabData = async (tabId, tabsArray = formTabs) => {
    try {
      const tab = tabsArray.find(t => t.id === tabId);
      if (!tab || tab.isDataLoaded) return;

      const response = await apiService.getSubmission(tabId, 'rental');
      console.log("response.submission_data: ", response)
      if (response && response.submission_data) {
        const sd = response.submission_data;
        const nameFromForm = sd.entityInfo?.businessName?.trim() || sd._metadata?.tab_name || undefined;
        setFormTabs(prev => prev.map(t => 
          t.id === tabId 
            ? { 
                ...t, 
                formData: {
                  entityInfo: sd.entityInfo || {},
                  ownerInfo: sd.ownerInfo || {},
                  propertyInfo: sd.propertyInfo || {},
                  incomeExpenses: sd.incomeExpenses || {},
                  notes: sd.notes || {},
                },
                isDataLoaded: true,
                name: nameFromForm || t.name,
              } 
            : t
        ));
      }
    } catch (error) {
      console.error('Error loading tab data:', error);
      toast({
        title: "Error",
        description: "Failed to load form data.",
        variant: "destructive",
      });
    }
  };

  const createEmptyDraft = async () => {
    try {
      const defaultName = 'Rental Property 1';
      const payload = {
        form_name: defaultName,
        form_type: 'rental',
        status: 'draft',
        submission_data: createDefaultFormData(),
      };
      
      const result = await apiService.createTaxFormSubmission(payload);
      
      if (result && result.id) {
        const newTab = {
          id: result.id,
          name: defaultName,
          formData: createDefaultFormData(),
          activeStep: 0,
          submissionId: result.id,
          status: 'draft',
          isDataLoaded: true,
        };
        
        setFormTabs([newTab]);
        setActiveTabId(newTab.id);
      }
    } catch (error) {
      console.error('Error creating empty draft:', error);
      toast({
        title: "Error",
        description: "Failed to create new form.",
        variant: "destructive",
      });
    }
  };

  const activeTab = formTabs.find(tab => tab.id === activeTabId) || formTabs[0];
  const isReadOnly = activeTab?.status === 'submitted';

  // Auto-save functionality - triggers every 5 minutes
  useEffect(() => {
    if (formTabs.length > 0 && !isLoadingData && activeTab && activeTab.status !== 'submitted') {
      const intervalId = setInterval(() => {
        console.log('Auto-saving current form (5 minute interval)...');
        handleSaveProgress();
      }, 5 * 60 * 1000); // 5 minutes in milliseconds
      
      return () => clearInterval(intervalId);
    }
  }, [isLoadingData, activeTabId]);

  const updateFormData = (section, data) => {
    if (isReadOnly) return; // Prevent updates to read-only forms
    
    setFormTabs(prev => prev.map(tab => 
      tab.id === activeTabId 
        ? { 
            ...tab, 
            formData: { 
              ...tab.formData, 
              [section]: data 
            } 
          }
        : tab
    ));
  };

  // Early return if no active tab (prevents undefined errors during initial load)
  if (!activeTab) {
    return null;
  }

  // Tab management functions
  const addFormTab = async () => {
    if (formTabs.length >= 20) {
      toast({
        title: "Tab Limit Reached",
        description: "You can only have up to 20 rental property forms.",
        variant: "destructive",
      });
      return;
    }

    try {
      const defaultName = `Rental Property ${formTabs.length + 1}`;
      const payload = {
        form_name: defaultName,
        form_type: 'rental',
        status: 'draft',
        submission_data: createDefaultFormData(),
      };
      
      const result = await apiService.createTaxFormSubmission(payload);
      
      if (result && result.id) {
        const newTab = {
          id: result.id,
          name: defaultName,
          formData: createDefaultFormData(),
          activeStep: 0,
          submissionId: result.id,
          status: 'draft',
          isDataLoaded: true,
        };
        
        setFormTabs(prev => [...prev, newTab]);
        setActiveTabId(newTab.id);
        
        toast({
          title: "Tab Added",
          description: `Created "${newTab.name}"`,
        });
      }
    } catch (error) {
      console.error('Error creating new form:', error);
      toast({
        title: "Error",
        description: "Failed to create new form.",
        variant: "destructive",
      });
    }
  };

  const switchTab = async (tabId) => {
    setActiveTabId(tabId);
    setEditingTabId(null);
    
    // Load tab data if not already loaded
    const tab = formTabs.find(t => t.id === tabId);
    if (tab && !tab.isDataLoaded && tab.submissionId) {
      await loadTabData(tabId);
    }
  };

  const startEditingTabName = (tabId, currentName) => {
    setEditingTabId(tabId);
    setEditingTabName(currentName);
  };

  const saveTabName = async () => {
    if (!editingTabName.trim()) {
      toast({
        title: "Invalid Name",
        description: "Tab name cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    try {
      const tab = formTabs.find(t => t.id === editingTabId);
      if (!tab?.isDataLoaded) {
        toast({
          title: "Form still loading",
          description: "Please wait for the form to load before renaming.",
          variant: "destructive",
        });
        return;
      }
      const payload = {
        form_name: editingTabName.trim(),
        form_type: 'rental',
        status: tab.status,
        submission_data: tab.formData,
      };

      await apiService.updateTaxFormSubmission(editingTabId, 'rental', payload);

      setFormTabs(prev => prev.map(tab =>
        tab.id === editingTabId ? { ...tab, name: editingTabName.trim() } : tab
      ));
      
      toast({
        title: "Name Updated",
        description: "Form name has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating form name:', error);
      toast({
        title: "Error",
        description: "Failed to update form name.",
        variant: "destructive",
      });
    } finally {
      setEditingTabId(null);
      setEditingTabName('');
    }
  };

  const cancelEditingTabName = () => {
    setEditingTabId(null);
    setEditingTabName('');
  };

  const confirmDeleteTab = (tabId) => {
    if (formTabs.length === 1) {
      toast({
        title: "Cannot Delete",
        description: "You must have at least one rental property form.",
        variant: "destructive",
      });
      return;
    }
    
    const tab = formTabs.find(t => t.id === tabId);
    if (tab?.status === 'submitted') {
      toast({
        title: "Cannot Delete",
        description: "Cannot delete a submitted form.",
        variant: "destructive",
      });
      return;
    }
    
    setTabToDelete(tabId);
  };

  const deleteTab = async () => {
    const tabIndex = formTabs.findIndex(tab => tab.id === tabToDelete);
    const deletedTab = formTabs.find(tab => tab.id === tabToDelete);
    
    try {
      // Call DELETE API
      await apiService.deleteSubmission(tabToDelete, 'rental');
      
      setFormTabs(prev => prev.filter(tab => tab.id !== tabToDelete));
      
      if (activeTabId === tabToDelete) {
        const newActiveTab = formTabs[tabIndex === 0 ? 1 : tabIndex - 1];
        setActiveTabId(newActiveTab.id);
      }
      
      toast({
        title: "Tab Deleted",
        description: `"${deletedTab ? getTabDisplayName(deletedTab, tabIndex) : ''}" has been deleted.`,
      });
    } catch (error) {
      console.error('Error deleting form:', error);
      toast({
        title: "Error",
        description: "Failed to delete form.",
        variant: "destructive",
      });
    } finally {
      setTabToDelete(null);
    }
  };

  const steps = [
    {
      id: 'entity-info',
      label: 'Entity Information',
      description: 'Business details and entity type',
      content: (
        <ReadOnlyWrapper readOnly={isReadOnly}>
          <RentalEntityInfo
            data={activeTab.formData.entityInfo}
            onChange={(data) => updateFormData('entityInfo', data)}
          />
        </ReadOnlyWrapper>
      ),
      isCompleted: Boolean(activeTab.formData.entityInfo.businessName || activeTab.formData.entityInfo.propertyInName),
      isRequired: true,
    },
    {
      id: 'owner-info',
      label: 'Owner Information',
      description: 'Property owner details',
      content: (
        <ReadOnlyWrapper readOnly={isReadOnly}>
          <RentalOwnerInfo
            data={activeTab.formData.ownerInfo}
            onChange={(data) => updateFormData('ownerInfo', data)}
          />
        </ReadOnlyWrapper>
      ),
      isCompleted: Boolean(activeTab.formData.ownerInfo.owners && activeTab.formData.ownerInfo.owners[0]?.firstName),
      isRequired: true,
    },
    {
      id: 'property-info',
      label: 'Property Information',
      description: 'Rental property details',
      content: (
        <ReadOnlyWrapper readOnly={isReadOnly}>
          <RentalPropertyInfo
            data={activeTab.formData.propertyInfo}
            onChange={(data) => updateFormData('propertyInfo', data)}
          />
        </ReadOnlyWrapper>
      ),
      isCompleted: Boolean(activeTab.formData.propertyInfo.propertyAddress),
      isRequired: true,
    },
    {
      id: 'income-expenses',
      label: 'Income & Expenses',
      description: 'Property income and expense details',
      content: (
        <ReadOnlyWrapper readOnly={isReadOnly}>
          <RentalIncomeExpenses
            data={activeTab.formData.incomeExpenses}
            onChange={(data) => updateFormData('incomeExpenses', data)}
          />
        </ReadOnlyWrapper>
      ),
      isCompleted: true,
      isRequired: false,
    },
    {
      id: 'review',
      label: 'Review & Submit',
      description: 'Review and submit your rental property organizer',
      content: (
        <ReadOnlyWrapper readOnly={isReadOnly}>
          <RentalReview
            data={activeTab.formData}
            onChange={(data) => {
              if (!isReadOnly) {
                setFormTabs(prev => prev.map(tab => 
                  tab.id === activeTabId 
                    ? { ...tab, formData: data }
                    : tab
                ));
              }
            }}
          />
        </ReadOnlyWrapper>
      ),
      isCompleted: false,
      isRequired: true,
    },
  ];

  const handleNext = () => {
    if (activeTab.activeStep < steps.length - 1) {
      setFormTabs(prev => prev.map(tab =>
        tab.id === activeTabId ? { ...tab, activeStep: tab.activeStep + 1 } : tab
      ));
    }
  };

  const handleStepChange = (stepIndex) => {
    setFormTabs(prev => prev.map(tab =>
      tab.id === activeTabId ? { ...tab, activeStep: stepIndex } : tab
    ));
  };

  const handleBack = () => {
    if (activeTab.activeStep > 0) {
      setFormTabs(prev => prev.map(tab =>
        tab.id === activeTabId ? { ...tab, activeStep: tab.activeStep - 1 } : tab
      ));
    }
  };

  const handleSubmit = async () => {
    if (isReadOnly) {
      toast({
        title: "Already Submitted",
        description: "This form has already been submitted and cannot be modified.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // For rental forms, we format the data similar to business forms
      const formattedPdfData = {
        formType: "rental",
        submissionDate: new Date().toISOString(),
        sections: {
          entityInfo: {
            sectionTitle: "Entity Information",
            questionsAndAnswers: activeTab.formData.entityInfo || {}
          },
          ownerInfo: {
            sectionTitle: "Owner Information",
            questionsAndAnswers: activeTab.formData.ownerInfo || {}
          },
          propertyInfo: {
            sectionTitle: "Property Information",
            questionsAndAnswers: activeTab.formData.propertyInfo || {}
          },
          incomeExpenses: {
            sectionTitle: "Income & Expenses",
            questionsAndAnswers: activeTab.formData.incomeExpenses || {}
          }
        }
      };

      const displayName = getTabDisplayName(activeTab, formTabs.findIndex(t => t.id === activeTabId)) || activeTab.name;
      const payload = {
        form_name: displayName,
        form_type: 'rental',
        status: 'submitted',
        submission_data: activeTab.formData,
        pdf_data: formattedPdfData,
      };

      await apiService.updateTaxFormSubmission(activeTab.submissionId, 'rental', payload);

      // Update the tab status to submitted
      setFormTabs(prev => prev.map(tab => 
        tab.id === activeTabId ? { ...tab, status: 'submitted' } : tab
      ));

      toast({
        title: "Success",
        description: "Form submitted successfully",
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: "Failed to submit form",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveProgress = async () => {
    if (isLoadingData || !activeTab || activeTab.status === 'submitted') return;
    if (!activeTab.isDataLoaded) {
      toast({
        title: "Form still loading",
        description: "Please wait for the form to load before saving.",
        variant: "destructive",
      });
      return;
    }

    try {
      const displayName = getTabDisplayName(activeTab, formTabs.findIndex(t => t.id === activeTabId)) || activeTab.name;
      const payload = {
        form_name: displayName,
        form_type: 'rental',
        status: 'draft',
        submission_data: activeTab.formData,
      };

      await apiService.updateTaxFormSubmission(activeTab.submissionId, 'rental', payload);
      
      toast({
        title: "Progress Saved",
        description: `"${displayName}" has been saved successfully.`,
      });
    } catch (error) {
      console.error('Error saving form:', error);
      toast({
        title: "Error",
        description: "Failed to save form.",
        variant: "destructive",
      });
    }
  };

  const handleBackWithSave = () => {
    if (!isReadOnly) handleSaveProgress(); // fire-and-forget, don't block navigation
    onBack();
  };

  if (isLoadingData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <Typography variant="body1" color="textSecondary">Loading forms...</Typography>
        </div>
      </Box>
    );
  }

  if (!activeTab) {
    return <Box>No forms available</Box>;
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" elevation={0} sx={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
        <Toolbar sx={{ 
          flexWrap: { xs: 'wrap', sm: 'nowrap' },
          minHeight: { xs: 'auto', sm: '64px' },
          py: { xs: 1, sm: 0 },
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: { xs: 1, sm: 0 }
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            width: { xs: '100%', sm: 'auto' }, 
            mb: { xs: 1, sm: 0 },
            flex: { sm: '1 1 auto' },
            minWidth: 0
          }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={handleBackWithSave}
              sx={{ 
                mr: { xs: 1, sm: 2 }, 
                color: '#64748b',
                minWidth: { xs: 'auto', sm: '64px' },
                px: { xs: 1, sm: 2 },
                flexShrink: 0
              }}
            >
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Back</Box>
            </Button>
            <HomeIcon sx={{ 
              mr: { xs: 1, sm: 2 }, 
              color: '#f97316', 
              fontSize: { xs: 20, sm: 24 },
              flexShrink: 0
            }} />
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                flexGrow: 1, 
                color: '#1e293b', 
                fontWeight: 600,
                fontSize: { xs: '1rem', sm: '1.25rem' },
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              Rental Property Organizer
            </Typography>
          </Box>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: { xs: 1, sm: 2 },
            width: { xs: '100%', sm: 'auto' },
            justifyContent: { xs: 'space-between', sm: 'flex-end' },
            flexShrink: 0
          }}>
            <FormControlLabel
              control={
                <Switch
                  checked={useVerticalStepper}
                  onChange={(e) => setUseVerticalStepper(e.target.checked)}
                  size="small"
                />
              }
              label={<Box component="span" sx={{ display: { xs: 'none', sm: 'inline' }, fontSize: '0.875rem' }}>Vertical Layout</Box>}
              sx={{ 
                mr: { xs: 0, sm: 2 }, 
                color: '#64748b',
                '& .MuiFormControlLabel-label': {
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                }
              }}
            />
            {!isReadOnly && (
              <Button
                startIcon={<SaveIcon />}
                onClick={handleSaveProgress}
                variant="outlined"
                size="small"
                disabled={isLoading}
                sx={{
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  px: { xs: 1, sm: 2 },
                  whiteSpace: { xs: 'nowrap', sm: 'normal' }
                }}
              >
                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                  {isLoading ? 'Saving...' : 'Save Progress'}
                </Box>
                <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                  {isLoading ? 'Saving...' : 'Save'}
                </Box>
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
        {isReadOnly && (
          <Alert 
            severity="info" 
            sx={{ 
              mb: 3, 
              borderRadius: 2,
              backgroundColor: '#e3f2fd',
              border: '1px solid #2196f3',
              '& .MuiAlert-icon': {
                color: '#1976d2',
              },
              '& .MuiAlert-message': {
                color: '#1565c0',
                fontWeight: 500,
              }
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
              Form Submitted
            </Typography>
            <Typography variant="body2" sx={{ color: '#424242' }}>
              This form has been submitted and is now read-only. No changes can be made to submitted forms.
            </Typography>
          </Alert>
        )}

        {/* Tabs Navigation */}
        <Tabs value={activeTabId} onValueChange={switchTab} className="mb-6">
          <Box sx={{ mb: 2, display: { xs: 'block', sm: 'flex' }, alignItems: { sm: 'center' }, justifyContent: { sm: 'space-between' } }}>
            {/* Mobile: Vertical List */}
            <Box sx={{ display: { xs: 'block', sm: 'none' }, mb: 2 }}>
              {formTabs.map((tab, index) => (
                <Box
                  key={tab.id}
                  onClick={() => switchTab(tab.id)}
                  sx={{
                    p: 2,
                    mb: 1,
                    borderRadius: 2,
                    border: activeTabId === tab.id ? '2px solid #f97316' : '1px solid #e2e8f0',
                    backgroundColor: activeTabId === tab.id ? '#fff7ed' : '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    '&:hover': {
                      backgroundColor: activeTabId === tab.id ? '#fff7ed' : '#f8fafc',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: activeTabId === tab.id ? 600 : 400 }}>
                      {getTabDisplayName(tab, index)}
                    </Typography>
                    {tab.status === 'submitted' && (
                      <Chip label="Submitted" size="small" color="success" sx={{ height: '20px', fontSize: '0.7rem' }} />
                    )}
                  </Box>
                  {tab.status !== 'submitted' && editingTabId !== tab.id && (
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditingTabName(tab.id, getTabDisplayName(tab, index));
                        }}
                        sx={{ p: 0.5 }}
                      >
                        <EditIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmDeleteTab(tab.id);
                        }}
                        sx={{ p: 0.5, color: 'error.main' }}
                      >
                        <DeleteIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>
                  )}
                </Box>
              ))}
            </Box>

            {/* Desktop: Horizontal Tabs */}
            <Box
              sx={{
                flex: 1,
                display: { xs: 'none', sm: 'block' },
                overflowX: 'auto',
                '&::-webkit-scrollbar': {
                  height: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: '#f1f1f1',
                  borderRadius: '3px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: '#888',
                  borderRadius: '3px',
                  '&:hover': {
                    backgroundColor: '#555',
                  },
                },
                scrollbarWidth: 'thin',
                scrollbarColor: '#888 #f1f1f1',
              }}
            >
              <TabsList 
                className="flex-1 justify-start"
                style={{
                  display: 'flex',
                  flexWrap: 'nowrap',
                  gap: '4px',
                  paddingBottom: '8px',
                }}
              >
              {formTabs.map((tab, index) => (
                <TabsTrigger key={tab.id} value={tab.id} className="relative group">
                  {editingTabId === tab.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={editingTabName}
                        onChange={(e) => setEditingTabName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveTabName();
                          if (e.key === 'Escape') cancelEditingTabName();
                        }}
                        className="w-32 px-2 py-1 text-sm border rounded"
                        autoFocus
                      />
                      <button onClick={saveTabName} className="p-1 hover:bg-accent rounded">
                        <CheckIcon sx={{ fontSize: 16 }} />
                      </button>
                      <button onClick={cancelEditingTabName} className="p-1 hover:bg-accent rounded">
                        <CloseIcon sx={{ fontSize: 16 }} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>{getTabDisplayName(tab, index)}</span>
                      {tab.status === 'submitted' && (
                        <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded">
                          Submitted
                        </span>
                      )}
                      {tab.status !== 'submitted' && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditingTabName(tab.id, getTabDisplayName(tab, index));
                            }}
                            className="p-1 hover:bg-accent rounded transition-colors"
                            title="Edit name"
                          >
                            <EditIcon sx={{ fontSize: 16 }} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmDeleteTab(tab.id);
                            }}
                            className="p-1 hover:bg-destructive/10 rounded text-destructive transition-colors"
                            title="Delete"
                          >
                            <DeleteIcon sx={{ fontSize: 16 }} />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
            </Box>
            
            <Button
              startIcon={<AddIcon />}
              onClick={addFormTab}
              variant="outlined"
              size="small"
              disabled={formTabs.length >= 20}
              sx={{ 
                ml: { xs: 0, sm: 2 },
                width: { xs: '100%', sm: 'auto' },
                mt: { xs: 2, sm: 0 }
              }}
            >
              Add Property
            </Button>
          </Box>

          {formTabs.map((tab, index) => (
            <TabsContent key={tab.id} value={tab.id}>
              <FormStepper
                steps={steps}
                activeStep={tab.activeStep}
                onStepChange={handleStepChange}
                onNext={handleNext}
                onBack={handleBack}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                submitLabel={`Submit ${getTabDisplayName(tab, index)}`}
                orientation={useVerticalStepper ? 'vertical' : 'horizontal'}
                disabled={isReadOnly}
              />
            </TabsContent>
          ))}
        </Tabs>
      </Container>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!tabToDelete} onOpenChange={() => setTabToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Rental Property Form?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{(() => {
                const t = formTabs.find(tab => tab.id === tabToDelete);
                return t ? getTabDisplayName(t, formTabs.findIndex(tab => tab.id === tabToDelete)) : '';
              })()}"? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteTab}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Box>
  );
};

export default RentalPropertyOrganizer;
