import React, { useState, useEffect, useRef } from 'react';
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
  SwapHoriz as FlipIcon,
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
import { FlipInfo } from './sections/FlipInfo';
import { FlipSalesInfo } from './sections/FlipSalesInfo';
import { FlipPurchaseInfo } from './sections/FlipPurchaseInfo';
import { FlipHoldingCosts } from './sections/FlipHoldingCosts';
import { FlipSummary } from './sections/FlipSummary';
import { apiService } from '../../services/api';
import { ReadOnlyWrapper } from '../shared/ReadOnlyWrapper';

const createDefaultFormData = () => ({
  flipInfo: {},
  salesInfo: {},
  purchaseInfo: {},
  holdingCosts: {},
  summary: {},
});

const createDefaultFormTab = (index = 0) => ({
  id: `flip_${Date.now()}_${index}`,
  name: `Flip ${index + 1}`,
  formData: createDefaultFormData(),
  activeStep: 0,
  submissionId: null,
  status: 'draft',
  isDataLoaded: false,
});

/** Tab label: use Address of Property from form when set, otherwise "Flip 1", "Flip 2", etc. */
const getTabDisplayName = (tab, index) => {
  const addr = tab?.formData?.flipInfo?.address?.trim();
  if (addr) return addr;
  const i = index ?? 0;
  if (tab?.name && /^Flip \d{10,}$/.test(tab.name)) return `Flip ${i + 1}`;
  return tab?.name || `Flip ${i + 1}`;
};

export const FlipOrganizer = ({
  onSave,
  onBack,
  initialData = {},
  userId,
  fillForUserId = null,
  isLoading = false,
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useVerticalStepper, setUseVerticalStepper] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [formTabs, setFormTabs] = useState([]);
  const [activeTabId, setActiveTabId] = useState('');
  const [editingTabId, setEditingTabId] = useState(null);
  const [editingTabName, setEditingTabName] = useState('');
  const [tabToDelete, setTabToDelete] = useState(null);
  const latestFormDataRef = useRef(null);

  const adminOptions = fillForUserId
    ? { forUserId: fillForUserId, useAdminToken: true }
    : {};
  const createOptions = fillForUserId ? { useAdminToken: true } : {};

  useEffect(() => {
    loadExistingSubmissions();
  }, [fillForUserId]);

  const loadExistingSubmissions = async () => {
    setIsLoadingData(true);
    try {
      const response = await apiService.getFormSubmissionsByType('flip', adminOptions);
      // Only show flip organizer forms: filter by form_type in case backend returns mixed types
      const flipSubmissions = Array.isArray(response)
        ? response.filter((s) => String(s.form_type || '').toLowerCase() === 'flip')
        : [];

      if (flipSubmissions.length > 0) {
        const tabs = flipSubmissions.map((submission, idx) => ({
          id: submission.id,
          name: submission.form_name || `Flip ${idx + 1}`,
          formData: createDefaultFormData(),
          activeStep: 0,
          submissionId: submission.id,
          status: submission.status,
          isDataLoaded: false,
        }));
        setFormTabs(tabs);
        setActiveTabId(tabs[0].id);
        const results = await Promise.allSettled(
          tabs.map((tab) => apiService.getSubmission(tab.id, 'flip', !!fillForUserId))
        );
        const mergedTabs = tabs.map((tab, i) => {
          const res = results[i];
          if (res.status !== 'fulfilled' || !res.value?.submission_data) return tab;
          const sd = res.value.submission_data;
          const nameFromForm = sd.flipInfo?.address?.trim() || sd._metadata?.tab_name || undefined;
          return {
            ...tab,
            formData: {
              flipInfo: sd.flipInfo || {},
              salesInfo: sd.salesInfo || {},
              purchaseInfo: sd.purchaseInfo || {},
              holdingCosts: sd.holdingCosts || {},
              summary: sd.summary || {},
            },
            isDataLoaded: true,
            name: nameFromForm || tab.name,
          };
        });
        setFormTabs(mergedTabs);
      } else {
        await createEmptyDraft();
      }
    } catch (error) {
      console.error('Error loading submissions:', error);
      if (error.status === 401 || error.message?.includes('401') || error.message?.includes('expired') || error.message?.includes('session')) {
        toast({ title: 'Session Expired', description: 'Your session has expired. Redirecting to login...', variant: 'destructive' });
        setTimeout(() => { if (window.location.pathname !== '/login') window.location.href = '/login'; }, 2000);
        return;
      }
      if (error.message?.includes('Failed to fetch') || error.message?.includes('Network')) {
        toast({ title: 'Network Error', description: 'Unable to connect to the server.', variant: 'destructive' });
        return;
      }
      toast({ title: 'Error', description: `Failed to load existing forms: ${error.message || 'Unknown error'}`, variant: 'destructive' });
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadTabData = async (tabId, tabsArray = formTabs) => {
    try {
      const tab = tabsArray.find((t) => t.id === tabId);
      if (!tab || tab.isDataLoaded) return;

      const response = await apiService.getSubmission(tabId, 'flip', !!fillForUserId);
      const sd = response?.submission_data;
      const nameFromForm = sd?.flipInfo?.address?.trim() || sd?._metadata?.tab_name || undefined;
      setFormTabs((prev) =>
        prev.map((t) =>
          t.id === tabId
            ? {
                ...t,
                formData: sd
                  ? {
                      flipInfo: sd.flipInfo || {},
                      salesInfo: sd.salesInfo || {},
                      purchaseInfo: sd.purchaseInfo || {},
                      holdingCosts: sd.holdingCosts || {},
                      summary: sd.summary || {},
                    }
                  : createDefaultFormData(),
                isDataLoaded: true,
                name: nameFromForm || t.name,
              }
            : t
        )
      );
    } catch (error) {
      console.error('Error loading tab data:', error);
      toast({ title: 'Error', description: 'Failed to load form data.', variant: 'destructive' });
      // Mark tab as loaded with empty data so the form still renders
      setFormTabs((prev) =>
        prev.map((t) =>
          t.id === tabId ? { ...t, isDataLoaded: true, formData: createDefaultFormData() } : t
        )
      );
    }
  };

  const createEmptyDraft = async () => {
    try {
      const defaultName = 'Flip 1';
      const payload = {
        form_name: defaultName,
        form_type: 'flip',
        status: 'draft',
        submission_data: createDefaultFormData(),
        ...(fillForUserId ? { target_user_id: Number(fillForUserId) } : {}),
      };
      const result = await apiService.createTaxFormSubmission(payload, createOptions);
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
      toast({ title: 'Error', description: 'Failed to create new form.', variant: 'destructive' });
    }
  };

  const activeTab = formTabs.find((tab) => tab.id === activeTabId) || formTabs[0];
  const isReadOnly = activeTab?.status === 'submitted';

  useEffect(() => {
    if (formTabs.length > 0 && !isLoadingData && activeTab && activeTab.status !== 'submitted') {
      const intervalId = setInterval(() => {
        handleSaveProgress();
      }, 5 * 60 * 1000);
      return () => clearInterval(intervalId);
    }
  }, [isLoadingData, activeTabId]);

  const updateFormData = (section, data) => {
    if (isReadOnly) return;
    setFormTabs((prev) =>
      prev.map((tab) => {
        if (tab.id !== activeTabId) return tab;
        const nextFormData = { ...tab.formData, [section]: data };
        latestFormDataRef.current = nextFormData;
        return { ...tab, formData: nextFormData };
      })
    );
  };

  useEffect(() => {
    if (activeTab?.formData) latestFormDataRef.current = activeTab.formData;
  }, [activeTabId]);

  if (!activeTab) {
    return null;
  }

  const addFormTab = async () => {
    if (formTabs.length >= 10) {
      toast({ title: 'Tab Limit Reached', description: 'You can only have up to 10 flip forms.', variant: 'destructive' });
      return;
    }
    try {
      const defaultName = `Flip ${formTabs.length + 1}`;
      const payload = {
        form_name: defaultName,
        form_type: 'flip',
        status: 'draft',
        submission_data: createDefaultFormData(),
        ...(fillForUserId ? { target_user_id: Number(fillForUserId) } : {}),
      };
      const result = await apiService.createTaxFormSubmission(payload, createOptions);
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
        setFormTabs((prev) => [...prev, newTab]);
        setActiveTabId(newTab.id);
        toast({ title: 'Tab Added', description: `Created "${newTab.name}"` });
      }
    } catch (error) {
      console.error('Error creating new form:', error);
      toast({ title: 'Error', description: 'Failed to create new form.', variant: 'destructive' });
    }
  };

  const switchTab = async (tabId) => {
    setActiveTabId(tabId);
    setEditingTabId(null);
    const tab = formTabs.find((t) => t.id === tabId);
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
      toast({ title: 'Invalid Name', description: 'Tab name cannot be empty.', variant: 'destructive' });
      return;
    }
    try {
      const tab = formTabs.find((t) => t.id === editingTabId);
      const payload = {
        form_name: editingTabName.trim(),
        form_type: 'flip',
        status: tab.status,
        submission_data: tab.formData,
      };
      await apiService.updateTaxFormSubmission(editingTabId, 'flip', payload, createOptions);
      setFormTabs((prev) =>
        prev.map((t) => (t.id === editingTabId ? { ...t, name: editingTabName.trim() } : t))
      );
      toast({ title: 'Name Updated', description: 'Form name has been updated successfully.' });
    } catch (error) {
      console.error('Error updating form name:', error);
      toast({ title: 'Error', description: 'Failed to update form name.', variant: 'destructive' });
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
      toast({ title: 'Cannot Delete', description: 'You must have at least one flip form.', variant: 'destructive' });
      return;
    }
    const tab = formTabs.find((t) => t.id === tabId);
    if (tab?.status === 'submitted') {
      toast({ title: 'Cannot Delete', description: 'Cannot delete a submitted form.', variant: 'destructive' });
      return;
    }
    setTabToDelete(tabId);
  };

  const deleteTab = async () => {
    const tabIndex = formTabs.findIndex((tab) => tab.id === tabToDelete);
    const deletedTab = formTabs.find((tab) => tab.id === tabToDelete);
    try {
      await apiService.deleteSubmission(tabToDelete, 'flip');
      setFormTabs((prev) => prev.filter((tab) => tab.id !== tabToDelete));
      if (activeTabId === tabToDelete) {
        const newActiveTab = formTabs[tabIndex === 0 ? 1 : tabIndex - 1];
        setActiveTabId(newActiveTab?.id ?? '');
      }
      const deletedIndex = formTabs.findIndex((tab) => tab.id === tabToDelete);
      toast({ title: 'Tab Deleted', description: `"${deletedTab ? getTabDisplayName(deletedTab, deletedIndex) : ''}" has been deleted.` });
    } catch (error) {
      console.error('Error deleting form:', error);
      toast({ title: 'Error', description: 'Failed to delete form.', variant: 'destructive' });
    } finally {
      setTabToDelete(null);
    }
  };

  const steps = [
    {
      id: 'flip-info',
      label: 'Flip Info',
      description: 'Property address and location',
      content: (
        <ReadOnlyWrapper readOnly={isReadOnly}>
          <FlipInfo
            data={activeTab.formData.flipInfo}
            onChange={(data) => updateFormData('flipInfo', data)}
          />
        </ReadOnlyWrapper>
      ),
      isCompleted: Boolean(activeTab.formData.flipInfo?.address || activeTab.formData.flipInfo?.city),
      isRequired: true,
    },
    {
      id: 'sales-info',
      label: 'Sales Information',
      description: 'Sales price, date, expenses, proceeds',
      content: (
        <ReadOnlyWrapper readOnly={isReadOnly}>
          <FlipSalesInfo
            data={activeTab.formData.salesInfo}
            onChange={(data) => updateFormData('salesInfo', data)}
          />
        </ReadOnlyWrapper>
      ),
      isCompleted: true,
      isRequired: false,
    },
    {
      id: 'purchase-info',
      label: 'Purchase Information',
      description: 'Purchase cost and related expenses',
      content: (
        <ReadOnlyWrapper readOnly={isReadOnly}>
          <FlipPurchaseInfo
            data={activeTab.formData.purchaseInfo}
            onChange={(data) => updateFormData('purchaseInfo', data)}
          />
        </ReadOnlyWrapper>
      ),
      isCompleted: true,
      isRequired: false,
    },
    {
      id: 'holding-costs',
      label: 'Holding Costs',
      description: 'Taxes, utilities, interest, etc.',
      content: (
        <ReadOnlyWrapper readOnly={isReadOnly}>
          <FlipHoldingCosts
            data={activeTab.formData.holdingCosts}
            onChange={(data) => updateFormData('holdingCosts', data)}
          />
        </ReadOnlyWrapper>
      ),
      isCompleted: true,
      isRequired: false,
    },
    {
      id: 'summary',
      label: 'Summary & Submit',
      description: 'Summary, calculation, and submit',
      content: (
        <ReadOnlyWrapper readOnly={isReadOnly}>
          <FlipSummary
            data={latestFormDataRef.current ?? activeTab.formData}
            onChange={(data) => {
              if (!isReadOnly) {
                latestFormDataRef.current = data;
                setFormTabs((prev) =>
                  prev.map((tab) => (tab.id === activeTabId ? { ...tab, formData: data } : tab))
                );
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
      const latest = latestFormDataRef.current;
      setFormTabs((prev) =>
        prev.map((tab) => {
          if (tab.id !== activeTabId) return tab;
          return {
            ...tab,
            formData: latest ?? tab.formData,
            activeStep: tab.activeStep + 1,
          };
        })
      );
    }
  };

  const handleStepChange = (stepIndex) => {
    const latest = latestFormDataRef.current;
    setFormTabs((prev) =>
      prev.map((tab) =>
        tab.id === activeTabId
          ? { ...tab, formData: latest ?? tab.formData, activeStep: stepIndex }
          : tab
      )
    );
  };

  const handleBack = () => {
    if (activeTab.activeStep > 0) {
      setFormTabs((prev) =>
        prev.map((tab) =>
          tab.id === activeTabId ? { ...tab, activeStep: tab.activeStep - 1 } : tab
        )
      );
    }
  };

  const handleSubmit = async () => {
    if (isReadOnly) {
      toast({ title: 'Already Submitted', description: 'This form has already been submitted.', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    try {
      const formattedPdfData = {
        formType: 'flip',
        submissionDate: new Date().toISOString(),
        sections: {
          flipInfo: { sectionTitle: 'Flip Info', questionsAndAnswers: activeTab.formData.flipInfo || {} },
          salesInfo: { sectionTitle: 'Sales Information', questionsAndAnswers: activeTab.formData.salesInfo || {} },
          purchaseInfo: { sectionTitle: 'Purchase Information', questionsAndAnswers: activeTab.formData.purchaseInfo || {} },
          holdingCosts: { sectionTitle: 'Holding Costs', questionsAndAnswers: activeTab.formData.holdingCosts || {} },
          summary: { sectionTitle: 'Summary and Calculation', questionsAndAnswers: activeTab.formData.summary || {} },
        },
      };
      const displayName = activeTab.formData?.flipInfo?.address?.trim() || activeTab.name;
      const payload = {
        form_name: displayName,
        form_type: 'flip',
        status: 'submitted',
        submission_data: activeTab.formData,
        pdf_data: formattedPdfData,
      };
      await apiService.updateTaxFormSubmission(activeTab.submissionId, 'flip', payload, createOptions);
      setFormTabs((prev) =>
        prev.map((tab) => (tab.id === activeTabId ? { ...tab, status: 'submitted' } : tab))
      );
      toast({ title: 'Success', description: 'Form submitted successfully' });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({ title: 'Error', description: 'Failed to submit form', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveProgress = async () => {
    if (isLoadingData || !activeTab || activeTab.status === 'submitted') return;
    try {
      const displayName = activeTab.formData?.flipInfo?.address?.trim() || activeTab.name;
      const payload = {
        form_name: displayName,
        form_type: 'flip',
        status: 'draft',
        submission_data: activeTab.formData,
      };
      await apiService.updateTaxFormSubmission(activeTab.submissionId, 'flip', payload, createOptions);
      toast({ title: 'Progress Saved', description: `"${displayName}" has been saved successfully.` });
    } catch (error) {
      console.error('Error saving form:', error);
      toast({ title: 'Error', description: 'Failed to save form.', variant: 'destructive' });
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
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
        <Toolbar sx={{ flexWrap: { xs: 'wrap', sm: 'nowrap' }, minHeight: { xs: 'auto', sm: '64px' }, py: { xs: 1, sm: 0 }, alignItems: { xs: 'flex-start', sm: 'center' }, gap: { xs: 1, sm: 0 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: { xs: '100%', sm: 'auto' }, mb: { xs: 1, sm: 0 }, flex: { sm: '1 1 auto' }, minWidth: 0 }}>
            <Button startIcon={<ArrowBackIcon />} onClick={handleBackWithSave} sx={{ mr: { xs: 1, sm: 2 }, color: '#64748b', minWidth: { xs: 'auto', sm: '64px' }, px: { xs: 1, sm: 2 }, flexShrink: 0 }}>
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Back</Box>
            </Button>
            <FlipIcon sx={{ mr: { xs: 1, sm: 2 }, color: '#06b6d4', fontSize: { xs: 20, sm: 24 }, flexShrink: 0 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: '#1e293b', fontWeight: 600, fontSize: { xs: '1rem', sm: '1.25rem' }, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Flip Organizer
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 }, width: { xs: '100%', sm: 'auto' }, justifyContent: { xs: 'space-between', sm: 'flex-end' }, flexShrink: 0 }}>
            <FormControlLabel
              control={<Switch checked={useVerticalStepper} onChange={(e) => setUseVerticalStepper(e.target.checked)} size="small" />}
              label={<Box component="span" sx={{ display: { xs: 'none', sm: 'inline' }, fontSize: '0.875rem' }}>Vertical Layout</Box>}
              sx={{ mr: { xs: 0, sm: 2 }, color: '#64748b' }}
            />
            {!isReadOnly && (
              <Button startIcon={<SaveIcon />} onClick={handleSaveProgress} variant="outlined" size="small" disabled={isLoading} sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, px: { xs: 1, sm: 2 }, whiteSpace: { xs: 'nowrap', sm: 'normal' } }}>
                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>{isLoading ? 'Saving...' : 'Save Progress'}</Box>
                <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>{isLoading ? 'Saving...' : 'Save'}</Box>
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
        {isReadOnly && (
          <Alert severity="info" sx={{ mb: 3, borderRadius: 2, backgroundColor: '#e3f2fd', border: '1px solid #2196f3' }}>
            <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>Form Submitted</Typography>
            <Typography variant="body2" sx={{ color: '#424242' }}>This form has been submitted and is now read-only.</Typography>
          </Alert>
        )}

        <Tabs value={activeTabId} onValueChange={switchTab} className="mb-6">
          <Box sx={{ mb: 2, display: { xs: 'block', sm: 'flex' }, alignItems: { sm: 'center' }, justifyContent: { sm: 'space-between' } }}>
            <Box sx={{ display: { xs: 'block', sm: 'none' }, mb: 2 }}>
              {formTabs.map((tab, index) => (
                <Box
                  key={tab.id}
                  onClick={() => switchTab(tab.id)}
                  sx={{
                    p: 2, mb: 1, borderRadius: 2,
                    border: activeTabId === tab.id ? '2px solid #06b6d4' : '1px solid #e2e8f0',
                    backgroundColor: activeTabId === tab.id ? '#ecfeff' : '#ffffff',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: activeTabId === tab.id ? 600 : 400 }}>{getTabDisplayName(tab, index)}</Typography>
                    {tab.status === 'submitted' && <Chip label="Submitted" size="small" color="success" sx={{ height: '20px', fontSize: '0.7rem' }} />}
                  </Box>
                  {tab.status !== 'submitted' && editingTabId !== tab.id && (
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); startEditingTabName(tab.id, getTabDisplayName(tab, index)); }} sx={{ p: 0.5 }}><EditIcon sx={{ fontSize: 16 }} /></IconButton>
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); confirmDeleteTab(tab.id); }} sx={{ p: 0.5, color: 'error.main' }}><DeleteIcon sx={{ fontSize: 16 }} /></IconButton>
                    </Box>
                  )}
                </Box>
              ))}
            </Box>

            <Box sx={{ flex: 1, display: { xs: 'none', sm: 'block' }, overflowX: 'auto' }}>
              <TabsList className="flex-1 justify-start" style={{ display: 'flex', flexWrap: 'nowrap', gap: '4px', paddingBottom: '8px' }}>
                {formTabs.map((tab, index) => (
                  <TabsTrigger key={tab.id} value={tab.id} className="relative group">
                    {editingTabId === tab.id ? (
                      <div className="flex items-center gap-1">
                        <input type="text" value={editingTabName} onChange={(e) => setEditingTabName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') saveTabName(); if (e.key === 'Escape') cancelEditingTabName(); }} className="w-32 px-2 py-1 text-sm border rounded" autoFocus />
                        <button onClick={saveTabName} className="p-1 hover:bg-accent rounded"><CheckIcon sx={{ fontSize: 16 }} /></button>
                        <button onClick={cancelEditingTabName} className="p-1 hover:bg-accent rounded"><CloseIcon sx={{ fontSize: 16 }} /></button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span>{getTabDisplayName(tab, index)}</span>
                        {tab.status === 'submitted' && <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded">Submitted</span>}
                        {tab.status !== 'submitted' && (
                          <div className="flex items-center gap-1">
                            <button onClick={(e) => { e.stopPropagation(); startEditingTabName(tab.id, getTabDisplayName(tab, index)); }} className="p-1 hover:bg-accent rounded transition-colors" title="Edit name"><EditIcon sx={{ fontSize: 16 }} /></button>
                            <button onClick={(e) => { e.stopPropagation(); confirmDeleteTab(tab.id); }} className="p-1 hover:bg-destructive/10 rounded text-destructive transition-colors" title="Delete"><DeleteIcon sx={{ fontSize: 16 }} /></button>
                          </div>
                        )}
                      </div>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Box>
            <Button startIcon={<AddIcon />} onClick={addFormTab} variant="outlined" size="small" disabled={formTabs.length >= 10} sx={{ ml: { xs: 0, sm: 2 }, width: { xs: '100%', sm: 'auto' }, mt: { xs: 2, sm: 0 } }}>
              Add Flip
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

      <AlertDialog open={!!tabToDelete} onOpenChange={() => setTabToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Flip Form?</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete "{(() => {
              const t = formTabs.find((tab) => tab.id === tabToDelete);
              return t ? getTabDisplayName(t, formTabs.findIndex((tab) => tab.id === tabToDelete)) : '';
            })()}"? This action cannot be undone.</AlertDialogDescription>
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

export default FlipOrganizer;
