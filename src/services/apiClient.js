const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.shoptosave.in/api/v1';

class ApiClient {
  constructor() {
    this.isRefreshing = false;
    this.refreshSubscribers = [];
  }

  _getHeaders(customHeaders = {}) {
    const headers = {
      ...customHeaders,
    };

    if (!headers.hasOwnProperty('Content-Type')) {
      headers['Content-Type'] = 'application/json';
    }

    if (headers['Content-Type'] === undefined || headers['Content-Type'] === null) {
      delete headers['Content-Type'];
    }

    const token = localStorage.getItem('s2s_access_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  // Handle errors and response parsing
  async _handleResponse(response) {
    const contentType = response.headers.get('content-type');
    let data = null;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const error = new Error(
        (data && data.result && data.result.message) ||
        (data && data.message) ||
        response.statusText ||
        'API Request Failed'
      );
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  }

  // Refresh token method
  async _refreshToken() {
    const refreshToken = localStorage.getItem('s2s_refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      // Perform token refresh API call
      // Note: We use raw fetch here to avoid interceptor recursion
      const response = await fetch(`${BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'refreshtoken': refreshToken,
        },
      });

      if (!response.ok) {
        throw new Error('Refresh token invalid');
      }

      const resData = await response.json();

      // Update tokens in localStorage
      if (resData.success && resData.result && resData.result.data) {
        const { access_token, refresh_token } = resData.result.data;
        localStorage.setItem('s2s_access_token', access_token);
        if (refresh_token) {
          localStorage.setItem('s2s_refresh_token', refresh_token);
        }
        return access_token;
      } else {
        throw new Error('Invalid token refresh response structure');
      }
    } catch (err) {
      // Clear auth data and trigger logout event
      localStorage.removeItem('s2s_access_token');
      localStorage.removeItem('s2s_refresh_token');
      localStorage.removeItem('s2s_admin_user');
      window.dispatchEvent(new Event('s2s_auth_expired'));
      throw err;
    }
  }

  // Wrapper for fetch requests with automatic 401 handling
  async request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;

    // Set headers
    options.headers = this._getHeaders(options.headers);

    try {
      const response = await fetch(url, options);

      // Handle token expiration (401 Unauthorized)
      if (response.status === 401 && localStorage.getItem('s2s_refresh_token')) {
        // Queue parallel requests while refreshing
        if (!this.isRefreshing) {
          this.isRefreshing = true;
          try {
            const newAccessToken = await this._refreshToken();
            this.isRefreshing = false;
            this.onTokenRefreshed(newAccessToken);
          } catch (refreshError) {
            this.isRefreshing = false;
            this.refreshSubscribers = [];
            throw refreshError;
          }
        }

        // Wait for token refresh and retry
        const retryRequest = new Promise((resolve) => {
          this.subscribeTokenRefresh((newToken) => {
            options.headers['Authorization'] = `Bearer ${newToken}`;
            resolve(fetch(url, options));
          });
        });

        const retryResponse = await retryRequest;
        return this._handleResponse(retryResponse);
      }

      return this._handleResponse(response);
    } catch (error) {
      if (error.status === 401) {
        // If 401 without refresh token, trigger logout event
        localStorage.removeItem('s2s_access_token');
        localStorage.removeItem('s2s_refresh_token');
        localStorage.removeItem('s2s_admin_user');
        window.dispatchEvent(new Event('s2s_auth_expired'));
      }
      throw error;
    }
  }

  subscribeTokenRefresh(cb) {
    this.refreshSubscribers.push(cb);
  }

  onTokenRefreshed(newToken) {
    this.refreshSubscribers.forEach((cb) => cb(newToken));
    this.refreshSubscribers = [];
  }

  // HTTP helper methods
  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, body, options = {}) {
    const isFormData = body instanceof FormData;
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
      headers: isFormData ? { 'Content-Type': null, ...options.headers } : options.headers,
    });
  }

  put(endpoint, body, options = {}) {
    const isFormData = body instanceof FormData;
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
      headers: isFormData ? { 'Content-Type': null, ...options.headers } : options.headers,
    });
  }

  patch(endpoint, body, options = {}) {
    const isFormData = body instanceof FormData;
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
      headers: isFormData ? { 'Content-Type': null, ...options.headers } : options.headers,
    });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

const apiClient = new ApiClient();
export default apiClient;
