// Utility functions for handling URL parameters

export const getUrlParams = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    userId: params.get('userId'),
    formType: params.get('type'),
    view: params.get('view'),
    formId: params.get('form_id'),
  };
};

export const setUrlParams = (params) => {
  const url = new URL(window.location);
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    } else {
      url.searchParams.delete(key);
    }
  });
  window.history.replaceState({}, '', url);
};

export const generateFormLink = (formId, formType, view = 'form') => {
  const baseUrl = window.location.origin;
  return `${baseUrl}?form_id=${formId}&type=${formType}&view=${view}`;
};

export const generateViewLink = (formId, formType) => {
  return generateFormLink(formId, formType, 'view');
};

export const generatePDFLink = (userId, formType) => {
  const apiBaseUrl = import.meta.env.VITE_API_URL || 'https://organizers.advancedtaxgroup.com/api';
  return `${apiBaseUrl}/${formType}-tax/${userId}/pdf/`;
};