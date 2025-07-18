import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';

export const useFormData = (formType, userId = null) => {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  // Load form data on component mount
  useEffect(() => {
    if (userId) {
      loadFormData();
    }
  }, [userId]);

  const loadFormData = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const response = formType === 'personal' 
        ? await apiService.getPersonalTaxForm(userId)
        : await apiService.getBusinessTaxForm(userId);
      
      setFormData(response.data || {});
    } catch (err) {
      setError('Failed to load form data');
      console.error('Error loading form data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-save functionality
  const autoSave = useCallback(async (data) => {
    if (!userId || isAutoSaving) return;

    setIsAutoSaving(true);
    try {
      await apiService.autoSave(data, userId, formType);
    } catch (err) {
      console.error('Auto-save failed:', err);
    } finally {
      setIsAutoSaving(false);
    }
  }, [userId, formType, isAutoSaving]);

  // Debounced auto-save
  useEffect(() => {
    if (!userId || Object.keys(formData).length === 0) return;

    const timeoutId = setTimeout(() => {
      autoSave(formData);
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(timeoutId);
  }, [formData, autoSave, userId]);

  const updateFormData = (section, data) => {
    setFormData(prev => ({
      ...prev,
      [section]: data,
    }));
  };

  const saveForm = async (isCompleted = false) => {
    setLoading(true);
    setError(null);

    try {
      const dataToSave = {
        ...formData,
        isCompleted
      };

      const response = formType === 'personal'
        ? await apiService.savePersonalTaxForm(dataToSave, userId)
        : await apiService.saveBusinessTaxForm(dataToSave, userId);

      return response;
    } catch (err) {
      setError('Failed to save form');
      console.error('Error saving form:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const submitForm = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = formType === 'personal'
        ? await apiService.submitPersonalTaxForm(userId, formData)
        : await apiService.submitBusinessTaxForm(userId, formData);

      return response;
    } catch (err) {
      setError('Failed to submit form');
      console.error('Error submitting form:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    setFormData,
    updateFormData,
    loading,
    error,
    isAutoSaving,
    saveForm,
    submitForm,
    loadFormData,
  };
};