// API Configuration
export const API_BASE_URL = __DEV__ 
  ? 'http://localhost:8000' 
  : 'https://your-production-api.com';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  SEND_OTP: '/auth/send-otp',
  OTP_LOGIN: '/auth/otp',
  ME: '/auth/me',
  
  // Chemicals
  CHEMICALS: '/chemicals',
  CHEMICAL_DETAIL: (id) => `/chemicals/${id}`,
  
  // Formulations
  FORMULATIONS: '/formulations',
  FORMULATION_DETAIL: (id) => `/formulations/${id}`,
  
  // Notifications
  NOTIFICATIONS: '/notifications',
  MARK_READ: (id) => `/notifications/${id}/read`,
  
  // Alerts
  ALERTS: '/alerts',
  
  // Users
  USERS: '/users',
  USER_DETAIL: (id) => `/users/${id}`,
  
  // Activity Logs
  ACTIVITY_LOGS: '/activity-logs',
  
  // Account Transactions
  ACCOUNT_TRANSACTIONS: '/account-transactions',
};

// Colors
export const COLORS = {
  // Primary Colors
  primary: '#2196F3',
  primaryDark: '#1976D2',
  primaryLight: '#BBDEFB',
  
  // Secondary Colors
  secondary: '#FF9800',
  secondaryDark: '#F57C00',
  secondaryLight: '#FFE0B2',
  
  // Status Colors
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  
  // Neutral Colors
  white: '#FFFFFF',
  black: '#000000',
  gray: '#9E9E9E',
  lightGray: '#F5F5F5',
  darkGray: '#424242',
  
  // Background Colors
  background: '#FAFAFA',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  
  // Text Colors
  textPrimary: '#212121',
  textSecondary: '#757575',
  textDisabled: '#BDBDBD',
  
  // Border Colors
  border: '#E0E0E0',
  divider: '#BDBDBD',
};

// Dark Theme Colors
export const DARK_COLORS = {
  ...COLORS,
  background: '#121212',
  surface: '#1E1E1E',
  card: '#2D2D2D',
  textPrimary: '#FFFFFF',
  textSecondary: '#B3B3B3',
  border: '#404040',
  divider: '#404040',
};

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Typography
export const TYPOGRAPHY = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
  },
  h4: {
    fontSize: 18,
    fontWeight: '600',
  },
  body1: {
    fontSize: 16,
    fontWeight: 'normal',
  },
  body2: {
    fontSize: 14,
    fontWeight: 'normal',
  },
  caption: {
    fontSize: 12,
    fontWeight: 'normal',
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
  },
};

// Border Radius
export const BORDER_RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 50,
};

// Shadow
export const SHADOW = {
  small: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6.27,
    elevation: 8,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10.32,
    elevation: 12,
  },
};

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  THEME: 'theme',
  LANGUAGE: 'language',
  NOTIFICATIONS_ENABLED: 'notifications_enabled',
};

// Validation Rules
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^\+?[1-9]\d{1,14}$/,
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
};

// Chemical Units
export const CHEMICAL_UNITS = [
  'g',
  'kg',
  'mg',
  'L',
  'mL',
  'mol',
  'mmol',
  'pieces',
  'bottles',
  'containers',
];

// Hazard Classifications
export const HAZARD_CLASSIFICATIONS = [
  'Non-hazardous',
  'Flammable',
  'Corrosive',
  'Toxic',
  'Oxidizing',
  'Explosive',
  'Environmental Hazard',
  'Health Hazard',
];

// Storage Locations
export const STORAGE_LOCATIONS = [
  'Room A - Cabinet 1',
  'Room A - Cabinet 2',
  'Room B - Refrigerator',
  'Room B - Freezer',
  'Room C - Ventilated Cabinet',
  'Room C - Safety Cabinet',
  'Storage Room 1',
  'Storage Room 2',
];

// Notification Types
export const NOTIFICATION_TYPES = {
  CHEMICAL_EXPIRY: 'chemical_expiry',
  LOW_STOCK: 'low_stock',
  SYSTEM_UPDATE: 'system_update',
  SECURITY_ALERT: 'security_alert',
  USER_ACTIVITY: 'user_activity',
};

// App Configuration
export const APP_CONFIG = {
  NAME: 'Chemical Inventory',
  VERSION: '1.0.0',
  BUILD_NUMBER: '1',
  SUPPORT_EMAIL: 'support@chemicalinventory.com',
  PRIVACY_POLICY_URL: 'https://chemicalinventory.com/privacy',
  TERMS_OF_SERVICE_URL: 'https://chemicalinventory.com/terms',
};

// Feature Flags
export const FEATURES = {
  OTP_LOGIN: true,
  QR_CODE_SCANNING: true,
  BARCODE_SCANNING: true,
  OFFLINE_MODE: false,
  PUSH_NOTIFICATIONS: true,
  DARK_THEME: true,
  MULTI_LANGUAGE: false,
}; 