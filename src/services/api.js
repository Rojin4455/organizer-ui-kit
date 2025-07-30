// API service for Django backend integration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
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

  // Personal Tax Form APIs
  async savePersonalTaxForm(data, formId = null) {
    const endpoint = formId ? `/form/tax-forms/submissions/${formId}/` : '/form/tax-forms/submissions/';
    const method = formId ? 'PUT' : 'POST';
    return this.request(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        ...data,
        form_type: 'personal',
        status: data.isCompleted ? 'completed' : 'draft'
      },
    });
  }

  async getPersonalTaxForm(userId) {
    return this.request(`/personal-tax/${userId}/`);
  }

  async submitPersonalTaxForm(userId, data) {
    return this.request(`/personal-tax/${userId}/submit/`, {
      method: 'POST',
      body: {
        ...data,
        status: 'completed'
      },
    });
  }

  // Business Tax Form APIs
  async saveBusinessTaxForm(data, formId = null) {
    const endpoint = formId ? `/form/tax-forms/submissions/${formId}/` : '/form/tax-forms/submissions/';
    const method = formId ? 'PUT' : 'POST';
    
    return this.request(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        ...data,
        form_type: 'business',
        status: data.isCompleted ? 'completed' : 'draft'
      },
    });
  }

  async getBusinessTaxForm(userId) {
    return this.request(`/business-tax/${userId}/`);
  }

  async submitBusinessTaxForm(userId, data) {
    return this.request(`/business-tax/${userId}/submit/`, {
      method: 'POST',
      body: {
        ...data,
        status: 'completed'
      },
    });
  }

  // Get user's forms
  async getUserForms(token) {
    return this.request('/form/tax-forms/submissions/user-forms/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
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

  // Get existing form data
  async getFormData(formId) {
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