// API service for Django backend integration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://tools.advancedtaxgroup.com/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    // Check if this is an admin endpoint and add admin token
    const isAdminEndpoint = endpoint.includes('/admin/');
    const adminToken = localStorage.getItem('adminAccessToken');
    const userToken = localStorage.getItem('accessToken');

    // Check if we should use admin token (either admin endpoint or admin-only context)
    const useAdminToken = options.useAdminToken || (adminToken && !userToken);

    const defaultHeaders = {
      'Content-Type': 'application/json; charset=utf-8',
      'Accept': 'application/json',
    };

    // Add appropriate token based on endpoint and context
    if ((isAdminEndpoint || useAdminToken) && adminToken && !options.headers?.Authorization) {
      defaultHeaders['Authorization'] = `Bearer ${adminToken}`;
    } else if (!isAdminEndpoint && !useAdminToken && userToken && !options.headers?.Authorization) {
      defaultHeaders['Authorization'] = `Bearer ${userToken}`;
    } else if (!options.headers?.Authorization && adminToken) {
      // Fallback: if no user token but admin token exists, use admin token
      defaultHeaders['Authorization'] = `Bearer ${adminToken}`;
    }

    // Handle body stringification before creating config
    let body = options.body;
    const isFormData = body instanceof FormData;

    if (body && typeof body === 'object' && !isFormData) {
      body = JSON.stringify(body);
    }

    // Build headers - ensure Content-Type is set for JSON
    const headers = {
      ...defaultHeaders,
      ...options.headers,
    };

    // Force Content-Type for JSON bodies if not already set and not FormData
    if (body && typeof body === 'string' && !isFormData) {
      headers['Content-Type'] = 'application/json; charset=utf-8';
    }

    // Remove Content-Type for FormData (browser will set it with boundary)
    if (isFormData) {
      delete headers['Content-Type'];
    }

    // Create config without spreading options.body and useAdminToken to avoid overwriting
    const { body: _, useAdminToken: __, ...optionsWithoutBody } = options;
    const config = {
      ...optionsWithoutBody,
      method: options.method || 'GET',
      headers: headers,
      body: body,
    };

    try {
      const response = await fetch(url, config);

      // Handle non-JSON responses (e.g., 401 with no body)
      let data;
      try {
        const text = await response.text();
        data = text ? JSON.parse(text) : {};
      } catch (parseError) {
        data = {};
      }

      if (!response.ok) {
        // Handle 401 Unauthorized - token expired
        if (response.status === 401) {
          const refreshToken = localStorage.getItem('refreshToken');
          const adminRefreshToken = localStorage.getItem('adminRefreshToken');

          // Try to refresh token if refresh token exists
          if (refreshToken && !isAdminEndpoint && !useAdminToken) {
            try {
              const refreshResponse = await fetch(`${this.baseURL}/token/refresh/`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refresh: refreshToken }),
              });

              if (refreshResponse.ok) {
                let refreshData;
                try {
                  refreshData = await refreshResponse.json();
                } catch (parseError) {
                  console.error('Failed to parse refresh response:', parseError);
                  throw new Error('Failed to refresh token');
                }

                // Update tokens in localStorage
                if (refreshData.access) {
                  localStorage.setItem('accessToken', refreshData.access);
                  if (refreshData.refresh) {
                    localStorage.setItem('refreshToken', refreshData.refresh);
                  }

                  // Retry original request with new token
                  config.headers['Authorization'] = `Bearer ${refreshData.access}`;
                  const retryResponse = await fetch(url, config);

                  // Parse retry response
                  let retryData;
                  try {
                    const retryText = await retryResponse.text();
                    retryData = retryText ? JSON.parse(retryText) : {};
                  } catch (parseError) {
                    retryData = {};
                  }

                  if (retryResponse.ok) {
                    return retryData;
                  } else {
                    // If retry also fails, throw error to trigger logout
                    const retryError = new Error(retryData.detail || retryData.message || 'Request failed after token refresh');
                    retryError.status = retryResponse.status;
                    retryError.responseData = retryData;
                    throw retryError;
                  }
                } else {
                  throw new Error('No access token in refresh response');
                }
              } else {
                // Refresh token is also expired
                throw new Error('Refresh token expired');
              }
            } catch (refreshError) {
              console.error('Token refresh failed:', refreshError);
            }
          }

          // If refresh failed or no refresh token, logout user
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('adminAccessToken');
          localStorage.removeItem('adminRefreshToken');

          // Dispatch logout event that components can listen to
          window.dispatchEvent(new CustomEvent('auth:logout', {
            detail: { reason: 'Token expired. Please log in again.' }
          }));

          // Redirect to login after a short delay
          setTimeout(() => {
            if (window.location.pathname !== '/login' && !window.location.pathname.includes('/atg-admin')) {
              window.location.href = '/login';
            } else if (window.location.pathname.includes('/atg-admin') && window.location.pathname !== '/atg-admin/login') {
              window.location.href = '/atg-admin/login';
            }
          }, 1000);

          const error = new Error('Your session has expired. Please log in again.');
          error.status = 401;
          error.responseData = data;
          throw error;
        }

        // Extract error message from response (handle Django REST Framework format)
        let errorMessage = data.error || data.message || data.detail;

        // Handle Django REST Framework validation errors
        // Format: { "field_name": ["Error message"], "another_field": ["Another error"] }
        // or: { "non_field_errors": ["Error message"] }
        if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
          // Check for non_field_errors first (general validation errors)
          if (data.non_field_errors && Array.isArray(data.non_field_errors) && data.non_field_errors.length > 0) {
            errorMessage = data.non_field_errors[0];
          }
          // Check for field-specific errors
          else {
            const errorKeys = Object.keys(data);
            if (errorKeys.length > 0) {
              // Collect all error messages from all fields
              const allErrors = [];
              errorKeys.forEach(key => {
                const fieldErrors = data[key];
                if (Array.isArray(fieldErrors)) {
                  allErrors.push(...fieldErrors);
                } else if (typeof fieldErrors === 'string') {
                  allErrors.push(fieldErrors);
                } else if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
                  allErrors.push(fieldErrors[0]);
                }
              });

              // Join all errors or take the first one
              if (allErrors.length > 0) {
                errorMessage = allErrors.join(' ');
              } else {
                // Fallback: try to extract from first field
                const firstKey = errorKeys[0];
                const firstValue = data[firstKey];
                if (Array.isArray(firstValue) && firstValue.length > 0) {
                  errorMessage = firstValue[0];
                } else if (typeof firstValue === 'string') {
                  errorMessage = firstValue;
                }
              }
            }
          }
        }

        // Handle array errors (e.g., ["Error message"])
        if (Array.isArray(errorMessage)) {
          errorMessage = errorMessage[0];
        }

        // Handle string errors
        if (typeof errorMessage === 'string') {
          // errorMessage is already a string, use it as is
        } else if (typeof errorMessage === 'object' && errorMessage !== null) {
          // Last resort: try to stringify or use first property
          const keys = Object.keys(errorMessage);
          if (keys.length > 0) {
            const firstValue = errorMessage[keys[0]];
            errorMessage = Array.isArray(firstValue) ? firstValue[0] : String(firstValue);
          } else {
            errorMessage = 'An error occurred';
          }
        }

        // Fallback to status message
        if (!errorMessage || (typeof errorMessage !== 'string')) {
          errorMessage = `HTTP error! status: ${response.status}`;
        }

        const error = new Error(String(errorMessage));
        error.status = response.status;
        error.responseData = data; // Store full response for debugging
        throw error;
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      // If it's already an Error with a message, throw it as is
      if (error instanceof Error) {
        throw error;
      }
      // Otherwise, create a new error
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }

  async submitClientProfile(formDataPayload, onProgress = null) {
    return new Promise((resolve, reject) => {
      const url = `${this.baseURL}/form/client-profile/`;

      const userToken = localStorage.getItem('accessToken');
      const adminToken = localStorage.getItem('adminAccessToken');
      const token = userToken || adminToken;

      const xhr = new XMLHttpRequest();
      xhr.open('POST', url, true);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.setRequestHeader('Accept', 'application/json');
      // Do NOT set Content-Type — browser sets multipart boundary automatically

      if (onProgress && xhr.upload) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            onProgress(Math.round((event.loaded / event.total) * 100));
          }
        };
      }

      xhr.onload = () => {
        let data;
        try {
          data = xhr.responseText ? JSON.parse(xhr.responseText) : {};
        } catch {
          data = {};
        }

        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(data);
        } else {
          const errorMessage =
            data.error || data.message || data.detail ||
            `HTTP error! status: ${xhr.status}`;
          const error = new Error(String(errorMessage));
          error.status = xhr.status;
          error.responseData = data;
          reject(error);
        }
      };

      xhr.onerror = () => reject(new Error('Network error during profile submission.'));
      xhr.ontimeout = () => reject(new Error('Request timed out during profile submission.'));

      xhr.send(formDataPayload);
    });
  }

  // Authentication APIs
  async login(email, password) {
    return this.request('/form/login/', {
      method: 'POST',
      body: { email, password },
    });
  }

  async signup(first_name, last_name, email, password, password_confirm) {
    return this.request('/form/signup/', {
      method: 'POST',
      body: { first_name, last_name, email, password, password_confirm },
    });
  }

  async refreshToken(refreshToken) {
    return this.request('/token/refresh/', {
      method: 'POST',
      body: { refresh: refreshToken },
    });
  }

  // Admin APIs
  async adminLogin(username, password) {
    return this.request('/form/admin/login/', {
      method: 'POST',
      body: { username, password },
    });
  }

  async getAdminUsers(search = '', page = 1) {
    const params = new URLSearchParams();
    if (search) {
      params.append('search', search);
    }
    if (page > 1) {
      params.append('page', page.toString());
    }
    const queryString = params.toString();
    const url = queryString
      ? `/form/admin/users/?${queryString}`
      : '/form/admin/users/';
    return this.request(url, {
      method: 'GET',
    });
  }

  async toggleUserActive(userId) {
    return this.request('/form/admin/users/toggle-active/', {
      method: 'POST',
      body: { user_id: userId },
    });
  }

  async getAdminUserForms(userId) {
    return this.request(`/form/admin/users/${userId}/forms/`, {
      method: 'GET',
    });
  }

  /** Reassign a submission from the current admin to a target client (admin only). */
  async reassignSubmissionToClient(submissionId, formType, targetUserId) {
    return this.request('/form/admin/submissions/reassign/', {
      method: 'POST',
      body: { submission_id: submissionId, form_type: formType, target_user_id: targetUserId },
    });
  }

  // Admin Management APIs (Super Admin only)
  async getAdminPermissions() {
    return this.request('/form/admin/permissions/', {
      method: 'GET',
      useAdminToken: true,
    });
  }

  async listAdmins() {
    return this.request('/form/admin/manage/list/', {
      method: 'GET',
      useAdminToken: true,
    });
  }

  async createAdmin(userId, permissions) {
    return this.request('/form/admin/manage/create/', {
      method: 'POST',
      useAdminToken: true,
      body: {
        user_id: userId,
        ...permissions,
      },
    });
  }

  async updateAdminPermissions(adminId, permissions) {
    return this.request('/form/admin/manage/update-permissions/', {
      method: 'POST',
      useAdminToken: true,
      body: {
        admin_id: adminId,
        ...permissions,
      },
    });
  }

  async deactivateAdmin(adminId) {
    return this.request('/form/admin/manage/deactivate/', {
      method: 'POST',
      useAdminToken: true,
      body: {
        admin_id: adminId,
      },
    });
  }

  async resetAdminPassword(adminId, newPassword, confirmPassword) {
    return this.request('/form/admin/manage/reset-password/', {
      method: 'POST',
      useAdminToken: true,
      body: {
        admin_id: adminId,
        new_password: newPassword,
        confirm_password: confirmPassword,
      },
    });
  }

  // Forgot Password APIs
  async requestOTP(email) {
    return this.request('/form/forgot-password/request-otp/', {
      method: 'POST',
      body: { email },
    });
  }

  async submitOTP(email, otp, new_password, confirm_password) {
    return this.request('/form/forgot-password/submit-otp/', {
      method: 'POST',
      body: { email, otp, new_password, confirm_password },
    });
  }

  // New unified Tax Form Submission APIs (simplified backend)
  // options: { useAdminToken: true } when admin is filling form for a client
  async createTaxFormSubmission(payload, options = {}) {
    console.log("Creating submission with payload: ", payload);

    return this.request('/survey/submit-tax-form/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      useAdminToken: !!options.useAdminToken,
    });
  }

  async updateTaxFormSubmission(formId, formType, payload, options = {}) {
    console.log("Updating submission with payload: ", payload);
    console.log("PDF data present: ", !!payload.pdf_data);

    return this.request(`/survey/submit-tax-form/${formId}/?type=${encodeURIComponent(formType)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      useAdminToken: !!options.useAdminToken,
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

  async getSubmission(formId, formType, useAdminToken = false) {
    // GET /survey/submit-tax-form/{id}/?type={formType}
    return this.request(`/survey/submit-tax-form/${formId}/?type=${encodeURIComponent(formType)}`, {
      method: 'GET',
      useAdminToken: useAdminToken,
    });
  }

  /**
   * Public submission by ID (no auth). For shareable links /submission/:id.
   * Accepts ID in any format (e.g. UUID with or without hyphens).
   */
  async getPublicSubmission(id) {
    const url = `${this.baseURL}/survey/submission/${encodeURIComponent(id)}/`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    if (!response.ok) {
      const text = await response.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { detail: text || 'Not found' };
      }
      throw new Error(data.detail || data.error || `Failed to load submission (${response.status})`);
    }
    return response.json();
  }

  // Get user's forms using new endpoint
  async getUserForms() {
    return this.request('/survey/all-submissions/', {
      method: 'GET',
    });
  }

  // Get all submissions for a specific form type
  // options: { forUserId: number, useAdminToken: true } when admin is loading client's forms
  async getFormSubmissionsByType(formType, options = {}) {
    let url = `/survey/each-form-submissions/?form_type=${formType}`;
    if (options.forUserId != null) {
      url += `&for_user_id=${encodeURIComponent(options.forUserId)}`;
    }
    return this.request(url, {
      method: 'GET',
      useAdminToken: !!options.useAdminToken,
    });
  }

  // Delete a submission
  async deleteSubmission(formId, formType) {
    return this.request(`/survey/submit-tax-form/${formId}/?type=${encodeURIComponent(formType)}`, {
      method: 'DELETE',
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

  // Tracker Finance Data APIs
  async getTrackerData() {
    return this.request('/tracker/finance-data/', {
      method: 'GET',
    });
  }

  async saveTrackerData(data) {
    return this.request('/tracker/finance-data/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  }

  async updateTrackerData(data) {
    return this.request('/tracker/finance-data/', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  }

  async deleteTrackerData() {
    return this.request('/tracker/finance-data/', {
      method: 'DELETE',
    });
  }

  async downloadTracker() {
    return this.request('/tracker/tracker-download/', {
      method: 'POST',
    });
  }


}

export const apiService = new ApiService();
export default apiService;