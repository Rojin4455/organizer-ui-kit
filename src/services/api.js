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

  // Personal Tax Form APIs
  async (data, userId = null) {
    const endpoint = userId ? `/personal-tax/${userId}/` : '/personal-tax/';
    const method = userId ? 'PUT' : 'POST';
    
    return this.request(endpoint, {
      method,
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
  async saveBusinessTaxForm(data, userId = null) {
    const endpoint = userId ? `/business-tax/${userId}/` : '/business-tax/';
    const method = userId ? 'PUT' : 'POST';
    
    return this.request(endpoint, {
      method,
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