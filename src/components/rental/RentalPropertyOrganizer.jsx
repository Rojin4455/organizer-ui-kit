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

const createDefaultFormData = () => ({
  entityInfo: {},
  ownerInfo: {},
  propertyInfo: {},
  incomeExpenses: {},
  notes: {},
});

const createDefaultFormTab = (id, name) => ({
  id,
  name,
  formData: createDefaultFormData(),
  activeStep: 0,
  submissionId: null,
  status: 'draft',
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
  
  // Tab management state
  const [formTabs, setFormTabs] = useState([createDefaultFormTab('rental_1', 'Rental Property 1')]);
  const [activeTabId, setActiveTabId] = useState('rental_1');
  const [editingTabId, setEditingTabId] = useState(null);
  const [editingTabName, setEditingTabName] = useState('');
  const [tabToDelete, setTabToDelete] = useState(null);

  const activeTab = formTabs.find(tab => tab.id === activeTabId) || formTabs[0];

  // Load initial data and create tabs from submissions
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      const dataToSet = initialData.submission_data || initialData;
      
      // Check if this is multi-tab data or single form data
      if (dataToSet && dataToSet.formTabs && Array.isArray(dataToSet.formTabs)) {
        // Multi-tab data
        setFormTabs(dataToSet.formTabs);
        setActiveTabId(dataToSet.activeTabId || dataToSet.formTabs[0].id);
      } else if (dataToSet && (dataToSet.entityInfo || dataToSet.ownerInfo || dataToSet.propertyInfo)) {
        // Legacy single form data - convert to tab format
        const hasExistingData = formTabs[0].formData.entityInfo && 
                                Object.keys(formTabs[0].formData.entityInfo).length > 0;
        
        if (!hasExistingData) {
          setFormTabs([{
            ...formTabs[0],
            formData: {
              entityInfo: dataToSet.entityInfo || {},
              ownerInfo: dataToSet.ownerInfo || {},
              propertyInfo: dataToSet.propertyInfo || {},
              incomeExpenses: dataToSet.incomeExpenses || {},
              notes: dataToSet.notes || {},
            },
            submissionId: initialData.id || null,
          }]);
        }
      }
    }
  }, [initialData]);

  // Auto-save functionality
  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem('rentalPropertyData', JSON.stringify({ formTabs, activeTabId }));
      handleSaveAllProgress();
    }, 2000);
    return () => clearTimeout(timeout);
  }, [formTabs]);

  const updateFormData = (section, data) => {
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

    const newTabNumber = formTabs.length + 1;
    const newTab = createDefaultFormTab(
      `rental_${Date.now()}`,
      `Rental Property ${newTabNumber}`
    );
    
    setFormTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
    
    toast({
      title: "Tab Added",
      description: `Created "${newTab.name}"`,
    });
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
        <RentalEntityInfo
          data={activeTab.formData.entityInfo}
          onChange={(data) => updateFormData('entityInfo', data)}
        />
      ),
      isCompleted: Boolean(activeTab.formData.entityInfo.businessName || activeTab.formData.entityInfo.propertyInName),
      isRequired: true,
    },
    {
      id: 'owner-info',
      label: 'Owner Information',
      description: 'Property owner details',
      content: (
        <RentalOwnerInfo
          data={activeTab.formData.ownerInfo}
          onChange={(data) => updateFormData('ownerInfo', data)}
        />
      ),
      isCompleted: Boolean(activeTab.formData.ownerInfo.owners && activeTab.formData.ownerInfo.owners[0]?.firstName),
      isRequired: true,
    },
    {
      id: 'property-info',
      label: 'Property Information',
      description: 'Rental property details',
      content: (
        <RentalPropertyInfo
          data={activeTab.formData.propertyInfo}
          onChange={(data) => updateFormData('propertyInfo', data)}
        />
      ),
      isCompleted: Boolean(activeTab.formData.propertyInfo.propertyAddress),
      isRequired: true,
    },
    {
      id: 'income-expenses',
      label: 'Income & Expenses',
      description: 'Property income and expense details',
      content: (
        <RentalIncomeExpenses
          data={activeTab.formData.incomeExpenses}
          onChange={(data) => updateFormData('incomeExpenses', data)}
        />
      ),
      isCompleted: true, // Optional section
      isRequired: false,
    },
    {
      id: 'review',
      label: 'Review & Submit',
      description: 'Review and submit your rental property organizer',
      content: (
        <RentalReview
          data={activeTab.formData}
          onChange={(data) => {
            setFormTabs(prev => prev.map(tab => 
              tab.id === activeTabId 
                ? { ...tab, formData: data }
                : tab
            ));
          }}
        />
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
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Update tab status to submitted
      setFormTabs(prev => prev.map(tab =>
        tab.id === activeTabId ? { ...tab, status: 'submitted' } : tab
      ));
      
      // Save with submitted status
      const dataToSave = {
        formTabs,
        activeTabId,
        _metadata: {
          tabName: activeTab.name,
          tabId: activeTab.id,
        }
      };
      
      await onSave(dataToSave, true);
      
      toast({
        title: "Submitted",
        description: `"${activeTab.name}" has been submitted successfully.`,
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: "Failed to submit form. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAllProgress = async () => {
    try {
      const dataToSave = {
        formTabs,
        activeTabId,
      };
      await onSave(dataToSave, false);
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

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
          <Button
            startIcon={<SaveIcon />}
            onClick={handleSaveAllProgress}
            variant="outlined"
            size="small"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save All Progress'}
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
        {/* Tabs Navigation */}
        <Tabs value={activeTabId} onValueChange={setActiveTabId} className="mb-6">
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
            <AlertDialogAction onClick={deleteTab} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Box>
  );
};