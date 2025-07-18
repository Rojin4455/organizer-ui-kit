// Utility functions for handling URL parameters

export const getUrlParams = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    userId: params.get('userId'),
    formType: params.get('type'),
    view: params.get('view'),
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

export const generateFormLink = (userId, formType, view = 'form') => {
  const baseUrl = window.location.origin;
  return `${baseUrl}?userId=${userId}&type=${formType}&view=${view}`;
};

export const generateViewLink = (userId, formType) => {
  return generateFormLink(userId, formType, 'view');
};

export const generatePDFLink = (userId, formType) => {
  const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
  return `${apiBaseUrl}/${formType}-tax/${userId}/pdf/`;
};