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
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Person as PersonIcon,
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
import { BasicTaxpayerInfo } from './sections/BasicTaxpayerInfo';
import { DependentInfo } from './sections/DependentInfo';
import { IncomeInfo } from './sections/IncomeInfo';
import { DeductionsInfo } from './sections/DeductionsInfo';
import { TaxPaymentsInfo } from './sections/TaxPaymentsInfo';
import { GeneralQuestions } from './sections/GeneralQuestions';
import { ReviewSubmit } from './sections/ReviewSubmit';
import { apiService } from '../../services/api';
import { ReadOnlyWrapper } from '../shared/ReadOnlyWrapper';

const createDefaultFormData = () => ({
  basicInfo: {},
  dependents: [],
  income: {},
  deductions: {},
  taxPayments: {},
  generalQuestions: {},
});

const createDefaultFormTab = (index = 0) => ({
  id: `personal_${Date.now()}_${index}`,
  name: `Personal Tax ${index + 1}`,
  formData: createDefaultFormData(),
  activeStep: 0,
  submissionId: null,
  status: 'draft',
  isDataLoaded: false,
});

export const PersonalTaxOrganizer = ({
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
      console.log('Loading personal submissions...');
      const response = await apiService.getFormSubmissionsByType('personal');
      console.log('Personal submissions response:', response);
      
      if (response && Array.isArray(response) && response.length > 0) {
        // Create tabs from existing submissions
        const tabs = response.map((submission) => ({
          id: submission.id,
          name: submission.form_name || 'Personal Tax',
          formData: createDefaultFormData(),
          activeStep: 0,
          submissionId: submission.id,
          status: submission.status,
          isDataLoaded: false,
        }));
        
        console.log('Created tabs from submissions:', tabs);
        setFormTabs(tabs);
        setActiveTabId(tabs[0].id);
        
        // Load the first tab's data
        await loadTabData(tabs[0].id, tabs);
      } else {
        console.log('No existing submissions, creating default tab');
        // Create empty draft on backend
        await createEmptyDraft();
      }
    } catch (error) {
      console.error('Error loading submissions:', error);
      toast({
        title: "Error",
        description: "Failed to load existing forms.",
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

      const response = await apiService.getSubmission(tabId, 'personal');
      
      if (response && response.submission_data) {
        console.log("response.submission_data: ", response)
        setFormTabs(prev => prev.map(t => 
          t.id === tabId 
            ? { 
                ...t, 
                formData: {
                  basicInfo: response.submission_data.basicInfo || {},
                  dependents: response.submission_data.dependents || [],
                  income: response.submission_data.income || {},
                  deductions: response.submission_data.deductions || {},
                  taxPayments: response.submission_data.taxPayments || {},
                  generalQuestions: response.submission_data.generalQuestions || {},
                },
                isDataLoaded: true,
                name: response.submission_data._metadata?.tab_name || t.name,
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
      const defaultName = `Personal Tax ${Date.now()}`;
      const payload = {
        form_name: defaultName,
        form_type: 'personal',
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
    if (formTabs.length >= 10) {
      toast({
        title: "Tab Limit Reached",
        description: "You can only have up to 10 personal tax forms.",
        variant: "destructive",
      });
      return;
    }

    try {
      const defaultName = `Personal Tax ${Date.now()}`;
      const payload = {
        form_name: defaultName,
        form_type: 'personal',
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
      const payload = {
        form_name: editingTabName.trim(),
        form_type: 'personal',
        status: tab.status,
        submission_data: tab.formData,
      };

      await apiService.updateTaxFormSubmission(editingTabId, 'personal', payload);

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
        description: "You must have at least one personal tax form.",
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
      await apiService.deleteSubmission(tabToDelete, 'personal');
      
      setFormTabs(prev => prev.filter(tab => tab.id !== tabToDelete));
      
      if (activeTabId === tabToDelete) {
        const newActiveTab = formTabs[tabIndex === 0 ? 1 : tabIndex - 1];
        setActiveTabId(newActiveTab.id);
      }
      
      toast({
        title: "Tab Deleted",
        description: `"${deletedTab?.name}" has been deleted.`,
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
      id: 'basic-info',
      label: 'Basic Information',
      description: 'Personal details, filing status, and contact information',
      content: (
        <ReadOnlyWrapper readOnly={isReadOnly}>
          <BasicTaxpayerInfo
            data={activeTab.formData.basicInfo}
            onChange={(data) => updateFormData('basicInfo', data)}
          />
        </ReadOnlyWrapper>
      ),
      isCompleted: Boolean(activeTab.formData.basicInfo.firstName && activeTab.formData.basicInfo.lastName && activeTab.formData.basicInfo.ssn),
      isRequired: true,
    },
    {
      id: 'dependents',
      label: 'Dependents',
      description: 'Information about dependents and child care expenses',
      content: (
        <ReadOnlyWrapper readOnly={isReadOnly}>
          <DependentInfo
            data={activeTab.formData.dependents}
            onChange={(data) => updateFormData('dependents', data)}
          />
        </ReadOnlyWrapper>
      ),
      isCompleted: true, // Optional section
      isRequired: false,
    },
    {
      id: 'general-questions',
      label: 'General Questions',
      description: 'Additional tax-related questions and situations',
      content: (
        <ReadOnlyWrapper readOnly={isReadOnly}>
          <GeneralQuestions
            data={activeTab.formData.generalQuestions}
            onChange={(data) => updateFormData('generalQuestions', data)}
          />
        </ReadOnlyWrapper>
      ),
      isCompleted: true, // Optional section
      isRequired: false,
    },
    {
      id: 'income',
      label: 'Income',
      description: 'W-2s, 1099s, and other income sources',
      content: (
        <ReadOnlyWrapper readOnly={isReadOnly}>
          <IncomeInfo
            data={activeTab.formData.income}
            onChange={(data) => updateFormData('income', data)}
          />
        </ReadOnlyWrapper>
      ),
      isCompleted: Boolean(activeTab.formData.income.hasW2 !== undefined),
      isRequired: true,
    },
    {
      id: 'deductions',
      label: 'Deductions',
      description: 'Medical expenses, charitable contributions, and other deductions',
      content: (
        <ReadOnlyWrapper readOnly={isReadOnly}>
          <DeductionsInfo
            data={activeTab.formData.deductions}
            onChange={(data) => updateFormData('deductions', data)}
          />
        </ReadOnlyWrapper>
      ),
      isCompleted: true, // Optional section
      isRequired: false,
    },
    {
      id: 'tax-payments',
      label: 'Tax Payments',
      description: 'Estimated tax payments and withholdings',
      content: (
        <ReadOnlyWrapper readOnly={isReadOnly}>
          <TaxPaymentsInfo
            data={activeTab.formData.taxPayments}
            onChange={(data) => updateFormData('taxPayments', data)}
          />
        </ReadOnlyWrapper>
      ),
      isCompleted: true, // Optional section
      isRequired: false,
    },
    {
      id: 'review',
      label: 'Review & Submit',
      description: 'Review your information and submit',
      content: (
        <ReadOnlyWrapper readOnly={isReadOnly}>
          <ReviewSubmit
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
    if (isReadOnly) return;
    if (activeTab.activeStep < steps.length - 1) {
      setFormTabs(prev => prev.map(tab =>
        tab.id === activeTabId ? { ...tab, activeStep: tab.activeStep + 1 } : tab
      ));
    }
  };

  const handleStepChange = (stepIndex) => {
    if (isReadOnly) return;
    setFormTabs(prev => prev.map(tab =>
      tab.id === activeTabId ? { ...tab, activeStep: stepIndex } : tab
    ));
  };

  const handleBack = () => {
    if (isReadOnly) return;
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
      const payload = {
        form_name: activeTab.name,
        form_type: 'personal',
        status: 'submitted',
        submission_data: activeTab.formData,
      };

      await apiService.updateTaxFormSubmission(activeTab.submissionId, 'personal', payload);

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
    
    try {
      const payload = {
        form_name: activeTab.name,
        form_type: 'personal',
        status: 'draft',
        submission_data: activeTab.formData,
      };

      await apiService.updateTaxFormSubmission(activeTab.submissionId, 'personal', payload);
      
      toast({
        title: "Progress Saved",
        description: `"${activeTab.name}" has been saved successfully.`,
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
        <Toolbar>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
            sx={{ mr: 2, color: '#64748b' }}
          >
            Back
          </Button>
          <PersonIcon sx={{ mr: 2, color: '#3b82f6' }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: '#1e293b', fontWeight: 600 }}>
            Personal Tax Organizer
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={useVerticalStepper}
                onChange={(e) => setUseVerticalStepper(e.target.checked)}
                size="small"
              />
            }
            label="Vertical Layout"
            sx={{ mr: 2, color: '#64748b' }}
          />
          {!isReadOnly && (
            <Button
              startIcon={<SaveIcon />}
              onClick={handleSaveProgress}
              variant="outlined"
              size="small"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Progress'}
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
        {isReadOnly && (
          <Box sx={{ mb: 3, p: 2, bgcolor: 'info.main', color: 'info.contrastText', borderRadius: 1 }}>
            <Typography variant="body2">
              ℹ️ This form has been submitted and is now read-only. No changes can be made.
            </Typography>
          </Box>
        )}

        {/* Tabs Navigation */}
        <Tabs value={activeTabId} onValueChange={switchTab} className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <TabsList className="flex-1 justify-start overflow-x-auto">
              {formTabs.map((tab) => (
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
                      <span>{tab.name}</span>
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
                              startEditingTabName(tab.id, tab.name);
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
            
            <Button
              startIcon={<AddIcon />}
              onClick={addFormTab}
              variant="outlined"
              size="small"
              disabled={formTabs.length >= 10}
              sx={{ ml: 2 }}
            >
              Add Form
            </Button>
          </div>

          {formTabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id}>
              <FormStepper
                steps={steps}
                activeStep={tab.activeStep}
                onStepChange={handleStepChange}
                onNext={handleNext}
                onBack={handleBack}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                submitLabel={`Submit ${tab.name}`}
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
            <AlertDialogTitle>Delete Personal Tax Form?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{formTabs.find(tab => tab.id === tabToDelete)?.name}"? 
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
