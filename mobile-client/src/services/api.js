import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_ENDPOINTS, STORAGE_KEYS } from '../constants';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = null;
    this.loadToken();
  }

  async loadToken() {
    try {
      this.token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error loading token:', error);
    }
  }

  async saveToken(token) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      this.token = token;
    } catch (error) {
      console.error('Error saving token:', error);
    }
  }

  async clearToken() {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      this.token = null;
    } catch (error) {
      console.error('Error clearing token:', error);
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  async request(endpoint, options = {}) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: this.getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle token expiration
        if (response.status === 401) {
          await this.clearToken();
          throw new Error('Authentication expired. Please login again.');
        }
        throw new Error(data.detail || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication Methods
  async login(credentials) {
    const response = await this.request(
      API_ENDPOINTS.LOGIN,
      {
        method: 'POST',
        body: JSON.stringify(credentials),
      }
    );

    if (response.success && response.data?.access_token) {
      await this.saveToken(response.data.access_token);
    }

    return response;
  }

  async register(userData) {
    return this.request(API_ENDPOINTS.REGISTER, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async sendOTP(phoneNumber) {
    return this.request(API_ENDPOINTS.SEND_OTP, {
      method: 'POST',
      body: JSON.stringify({ phone_number: phoneNumber }),
    });
  }

  async loginWithOTP(otpData) {
    const response = await this.request(
      API_ENDPOINTS.OTP_LOGIN,
      {
        method: 'POST',
        body: JSON.stringify(otpData),
      }
    );

    if (response.success && response.data?.access_token) {
      await this.saveToken(response.data.access_token);
    }

    return response;
  }

  async getCurrentUser() {
    return this.request(API_ENDPOINTS.ME);
  }

  async logout() {
    await this.clearToken();
  }

  // Chemical Methods
  async getChemicals(params = {}) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.supplier) queryParams.append('supplier', params.supplier);
    if (params?.hazard_classification) queryParams.append('hazard_classification', params.hazard_classification);

    const endpoint = `${API_ENDPOINTS.CHEMICALS}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request(endpoint);
  }

  async getChemical(id) {
    return this.request(API_ENDPOINTS.CHEMICAL_DETAIL(id));
  }

  async createChemical(chemicalData) {
    return this.request(API_ENDPOINTS.CHEMICALS, {
      method: 'POST',
      body: JSON.stringify(chemicalData),
    });
  }

  async updateChemical(id, chemicalData) {
    return this.request(API_ENDPOINTS.CHEMICAL_DETAIL(id), {
      method: 'PUT',
      body: JSON.stringify(chemicalData),
    });
  }

  async deleteChemical(id) {
    return this.request(API_ENDPOINTS.CHEMICAL_DETAIL(id), {
      method: 'DELETE',
    });
  }

  // Formulation Methods
  async getFormulations(params = {}) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.search) queryParams.append('search', params.search);

    const endpoint = `${API_ENDPOINTS.FORMULATIONS}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request(endpoint);
  }

  async getFormulation(id) {
    return this.request(API_ENDPOINTS.FORMULATION_DETAIL(id));
  }

  async createFormulation(formulationData) {
    return this.request(API_ENDPOINTS.FORMULATIONS, {
      method: 'POST',
      body: JSON.stringify(formulationData),
    });
  }

  async updateFormulation(id, formulationData) {
    return this.request(API_ENDPOINTS.FORMULATION_DETAIL(id), {
      method: 'PUT',
      body: JSON.stringify(formulationData),
    });
  }

  async deleteFormulation(id) {
    return this.request(API_ENDPOINTS.FORMULATION_DETAIL(id), {
      method: 'DELETE',
    });
  }

  // Notification Methods
  async getNotifications(params = {}) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.unread_only) queryParams.append('unread_only', 'true');

    const endpoint = `${API_ENDPOINTS.NOTIFICATIONS}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request(endpoint);
  }

  async markNotificationAsRead(id) {
    return this.request(API_ENDPOINTS.MARK_READ(id), {
      method: 'PUT',
    });
  }

  async markAllNotificationsAsRead() {
    return this.request(`${API_ENDPOINTS.NOTIFICATIONS}/mark-all-read`, {
      method: 'PUT',
    });
  }

  // Alert Methods
  async getAlerts() {
    return this.request(API_ENDPOINTS.ALERTS);
  }

  // User Methods
  async getUsers(params = {}) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.role) queryParams.append('role', params.role);

    const endpoint = `${API_ENDPOINTS.USERS}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request(endpoint);
  }

  async updateUser(id, userData) {
    return this.request(API_ENDPOINTS.USER_DETAIL(id), {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async approveUser(id) {
    return this.request(`${API_ENDPOINTS.USER_DETAIL(id)}/approve`, {
      method: 'PUT',
    });
  }

  // Activity Log Methods
  async getActivityLogs(params = {}) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.user_id) queryParams.append('user_id', params.user_id.toString());
    if (params?.action) queryParams.append('action', params.action);

    const endpoint = `${API_ENDPOINTS.ACTIVITY_LOGS}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request(endpoint);
  }

  // Account Transaction Methods
  async getAccountTransactions(params = {}) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.user_id) queryParams.append('user_id', params.user_id.toString());
    if (params?.transaction_type) queryParams.append('transaction_type', params.transaction_type);

    const endpoint = `${API_ENDPOINTS.ACCOUNT_TRANSACTIONS}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request(endpoint);
  }

  // Utility Methods
  isAuthenticated() {
    return !!this.token;
  }

  getToken() {
    return this.token;
  }
}

export const apiService = new ApiService();
export default apiService; 