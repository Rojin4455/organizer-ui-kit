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
        const tabs = response.map((submission, index) => ({
          id: submission.id,
          name: `Rental ${index + 1}`,
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
        // No existing submissions, create default tab
        initializeDefaultTab();
      }
    } catch (error) {
      console.error('Error loading submissions:', error);
      toast({
        title: "Error",
        description: "Failed to load existing forms. Creating new form.",
        variant: "destructive",
      });
      initializeDefaultTab();
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadTabData = async (tabId, tabsArray = formTabs) => {
    try {
      const tab = tabsArray.find(t => t.id === tabId);
      if (!tab || tab.isDataLoaded) return;

      const response = await apiService.getSubmission(tabId, 'rental');
      
      if (response && response.submission_data) {
        setFormTabs(prev => prev.map(t => 
          t.id === tabId 
            ? { 
                ...t, 
                formData: {
                  entityInfo: response.submission_data.entityInfo || {},
                  ownerInfo: response.submission_data.ownerInfo || {},
                  propertyInfo: response.submission_data.propertyInfo || {},
                  incomeExpenses: response.submission_data.incomeExpenses || {},
                  notes: response.submission_data.notes || {},
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

  const initializeDefaultTab = () => {
    const defaultTab = createDefaultFormTab(0);
    defaultTab.isDataLoaded = true; // New tabs are already "loaded"
    setFormTabs([defaultTab]);
    setActiveTabId(defaultTab.id);
    setIsLoadingData(false);
  };

  const activeTab = formTabs.find(tab => tab.id === activeTabId) || formTabs[0];
  const isReadOnly = activeTab?.status === 'submitted';

  // Auto-save functionality - triggers every 5 minutes
  useEffect(() => {
    if (formTabs.length > 0 && !isLoadingData) {
      const intervalId = setInterval(() => {
        console.log('Auto-saving forms (5 minute interval)...');
        handleSaveAllProgress();
      }, 5 * 60 * 1000); // 5 minutes in milliseconds
      
      return () => clearInterval(intervalId);
    }
  }, [isLoadingData]);

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
  const addFormTab = () => {
    if (formTabs.length >= 10) {
      toast({
        title: "Tab Limit Reached",
        description: "You can only have up to 10 rental property forms.",
        variant: "destructive",
      });
      return;
    }

    const newTab = createDefaultFormTab(formTabs.length);
    newTab.isDataLoaded = true; // New tabs are already "loaded"
    
    setFormTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
    
    toast({
      title: "Tab Added",
      description: `Created "${newTab.name}"`,
    });
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

  const saveTabName = () => {
    if (!editingTabName.trim()) {
      toast({
        title: "Invalid Name",
        description: "Tab name cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    setFormTabs(prev => prev.map(tab =>
      tab.id === editingTabId ? { ...tab, name: editingTabName.trim() } : tab
    ));
    setEditingTabId(null);
    setEditingTabName('');
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

  const deleteTab = () => {
    const tabIndex = formTabs.findIndex(tab => tab.id === tabToDelete);
    
    setFormTabs(prev => prev.filter(tab => tab.id !== tabToDelete));
    
    if (activeTabId === tabToDelete) {
      const newActiveTab = formTabs[tabIndex === 0 ? 1 : tabIndex - 1];
      setActiveTabId(newActiveTab.id);
    }
    
    const deletedTabName = formTabs.find(tab => tab.id === tabToDelete)?.name;
    toast({
      title: "Tab Deleted",
      description: `"${deletedTabName}" has been deleted.`,
    });
    
    setTabToDelete(null);
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
      // Generate unique form name using tab name and timestamp
      const uniqueFormName = `${activeTab.name}_${Date.now()}`;
      
      // Submit only the active tab
      const dataToSubmit = {
        ...activeTab.formData,
        form_name: uniqueFormName,
        _metadata: {
          tab_name: activeTab.name,
          status: 'submitted',
        }
      };

      if (onSave) {
        const result = await onSave(dataToSubmit, true);
        
        // Update tab with submission ID if returned
        if (result && result.id && !activeTab.submissionId) {
          setFormTabs(prev => prev.map(tab => 
            tab.id === activeTabId ? { ...tab, submissionId: result.id } : tab
          ));
        }
      }

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

  const handleSaveAllProgress = async () => {
    if (isLoadingData) return;
    
    try {
      // Save all tabs as drafts (skip submitted forms)
      const savePromises = formTabs.map(async (tab) => {
        if (tab.status === 'submitted') return;
        
        // Generate unique form name if not already present
        const uniqueFormName = tab.formData.form_name || `${tab.name}_${Date.now()}`;
        
        const dataToSave = {
          ...tab.formData,
          form_name: uniqueFormName,
          _metadata: {
            tab_name: tab.name,
            status: 'draft',
          }
        };

        if (onSave) {
          const result = await onSave(dataToSave, false);
          
          // Update tab with new submission ID if it was just created
          if (result && result.id && !tab.submissionId) {
            setFormTabs(prev => prev.map(t => 
              t.id === tab.id ? { ...t, submissionId: result.id } : t
            ));
          }
        }
      });

      await Promise.all(savePromises);
      
      toast({
        title: "Progress Saved",
        description: "All forms have been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving forms:', error);
      toast({
        title: "Error",
        description: "Failed to save some forms.",
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
          <HomeIcon sx={{ mr: 2, color: '#f97316' }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: '#1e293b', fontWeight: 600 }}>
            Rental Property Organizer
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
              onClick={handleSaveAllProgress}
              variant="outlined"
              size="small"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save All Progress'}
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
                    <>
                      <span>{tab.name}</span>
                      {tab.status === 'submitted' && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded">
                          Submitted
                        </span>
                      )}
                      {tab.status !== 'submitted' && (
                        <div className="hidden group-hover:flex items-center gap-1 ml-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditingTabName(tab.id, tab.name);
                            }}
                            className="p-1 hover:bg-accent rounded"
                          >
                            <EditIcon sx={{ fontSize: 16 }} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmDeleteTab(tab.id);
                            }}
                            className="p-1 hover:bg-destructive/10 rounded text-destructive"
                          >
                            <DeleteIcon sx={{ fontSize: 16 }} />
                          </button>
                        </div>
                      )}
                    </>
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
              Add Property
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
            <AlertDialogTitle>Delete Rental Property Form?</AlertDialogTitle>
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

export default RentalPropertyOrganizer;
