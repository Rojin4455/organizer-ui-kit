// API service for Django backend integration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://organizers.advancedtaxgroup.com/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Accept': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication APIs
  async login(username, password) {
    return this.request('/form/login/', {
      method: 'POST',
      body: { username, password },
    });
  }

  async signup(username, email, password, password_confirm) {
    return this.request('/form/signup/', {
      method: 'POST',
      body: { username, email, password, password_confirm },
    });
  }

  async refreshToken(refreshToken) {
    return this.request('/token/refresh/', {
      method: 'POST',
      body: { refresh: refreshToken },
    });
  }

  // New unified Tax Form Submission APIs (simplified backend)
  async createTaxFormSubmission(payload) {
    console.log("Creating submission with payload: ", payload);
    
    // Always send as JSON for simplicity and consistency
    return this.request('/survey/submit-tax-form/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  }

  async updateTaxFormSubmission(formId, formType, payload) {
    console.log("Updating submission with payload: ", payload);
    console.log("PDF data present: ", !!payload.pdf_data);
    
    // Always send as JSON for simplicity and consistency
    return this.request(`/survey/submit-tax-form/${formId}/?type=${encodeURIComponent(formType)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  }

// Alternative approach using FormData (if you prefer multipart)
// Only use this if the JSON approach above doesn't work
async createTaxFormSubmissionMultipart(payload) {
    console.log("Creating submission with payload: ", payload);
    
    if (payload.pdf_data) {
      const formData = new FormData();
      
      // Add all non-PDF data
      Object.keys(payload).forEach(key => {
        if (key !== 'pdf_data') {
          const value = payload[key];
          if (typeof value === 'object' && value !== null) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value || '');
          }
        }
      });
      
      // Add PDF data
      formData.append('pdf_data', payload.pdf_data);
      
      // Debug: Log FormData contents
      console.log("FormData contents:");
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + (pair[1].length > 100 ? '[PDF DATA]' : pair[1]));
      }
      
      return this.request('/survey/submit-tax-form/', {
        method: 'POST',
        body: formData,
        // Explicitly don't set Content-Type - let browser set it with boundary
      });
    }
    
    // Fallback to JSON if no PDF
    return this.request('/survey/submit-tax-form/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  }

  async updateTaxFormSubmissionMultipart(formId, formType, payload) {
    console.log("Updating submission with payload: ", payload);
    
    if (payload.pdf_data) {
      const formData = new FormData();
      
      // Add all non-PDF data
      Object.keys(payload).forEach(key => {
        if (key !== 'pdf_data') {
          const value = payload[key];
          if (typeof value === 'object' && value !== null) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value || '');
          }
        }
      });
      
      // Add PDF data
      formData.append('pdf_data', payload.pdf_data);
      
      console.log("PDF data present, size: ", payload.pdf_data.length);
      
      // Debug: Log FormData contents
      console.log("FormData contents:");
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + (pair[1].length > 100 ? '[PDF DATA]' : pair[1]));
      }
      
      return this.request(`/survey/submit-tax-form/${formId}/?type=${encodeURIComponent(formType)}`, {
        method: 'PUT',
        body: formData,
        // Explicitly don't set Content-Type - let browser set it with boundary
      });
    }
    
    // Fallback to JSON if no PDF
    return this.request(`/survey/submit-tax-form/${formId}/?type=${encodeURIComponent(formType)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  }

  async getSubmission(formId, formType) {
    // GET /survey/submit-tax-form/{id}/?type={formType}
    return this.request(`/survey/submit-tax-form/${formId}/?type=${encodeURIComponent(formType)}`, {
      method: 'GET',
    });
  }

  // Get user's forms using new endpoint
  async getUserForms() {
    return this.request('/survey/all-submissions/', {
      method: 'GET',
    });
  }

  // PDF Generation
  async generatePDF(userId, formType) {
    const response = await fetch(`${this.baseURL}/${formType}-tax/${userId}/pdf/`, {
      method: 'GET',
      headers: {
        'Accept': 'application/pdf',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to generate PDF: ${response.status}`);
    }

    return response.blob();
  }

  // Download PDF for a form
  async downloadFormPDF(formId, token) {
    const response = await fetch(`${this.baseURL}/form/tax-forms/submissions/${formId}/pdf/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/pdf',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to download PDF: ${response.status}`);
    }

    return response.blob();
  }

  // Get existing form formatted data (deprecated in new flow)
  async getFormData(formId) {
    // Keeping for backward compatibility if needed; prefer getSubmission
    return this.request(`/form/tax-forms/submissions/${formId}/formatted_data/`);
  }

  // Auto-save functionality
  async autoSave(data, userId, formType) {
    const endpoint = `/${formType}-tax/${userId}/auto-save/`;
    
    return this.request(endpoint, {
      method: 'PATCH',
      body: {
        data,
        last_saved: new Date().toISOString()
      },
    });
  }
}

export const apiService = new ApiService();
export default apiService;