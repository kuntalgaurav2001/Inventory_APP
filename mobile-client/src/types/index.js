/**
 * @typedef {Object} User
 * @property {number} id - User ID
 * @property {string} uid - Unique identifier
 * @property {string} email - User email
 * @property {string} first_name - First name
 * @property {string} [last_name] - Last name (optional)
 * @property {string} [phone] - Phone number (optional)
 * @property {string} role - User role
 * @property {boolean} is_approved - Approval status
 * @property {string} created_at - Creation timestamp
 * @property {string} updated_at - Last update timestamp
 * @property {string} [last_seen] - Last seen timestamp (optional)
 * @property {boolean} [is_online] - Online status (optional)
 */

/**
 * User roles enum
 */
export const UserRole = {
  ADMIN: 'admin',
  ALL_USERS: 'all_users',
  CHEMICAL_MANAGER: 'chemical_manager',
  ACCOUNT_TEAM: 'account_team'
};

/**
 * @typedef {Object} Chemical
 * @property {number} id - Chemical ID
 * @property {string} name - Chemical name
 * @property {string} cas_number - CAS number
 * @property {string} molecular_formula - Molecular formula
 * @property {number} molecular_weight - Molecular weight
 * @property {number} purity - Purity percentage
 * @property {string} supplier - Supplier name
 * @property {string} lot_number - Lot number
 * @property {string} expiry_date - Expiry date
 * @property {string} storage_location - Storage location
 * @property {number} quantity - Quantity
 * @property {string} unit - Unit of measurement
 * @property {string} hazard_classification - Hazard classification
 * @property {string} [safety_data_sheet_url] - Safety data sheet URL (optional)
 * @property {string} [notes] - Additional notes (optional)
 * @property {number} created_by - Creator user ID
 * @property {string} created_at - Creation timestamp
 * @property {string} updated_at - Last update timestamp
 * @property {number} [last_updated_by] - Last updater user ID (optional)
 * @property {boolean} is_active - Active status
 */

/**
 * @typedef {Object} ChemicalFormData
 * @property {string} name - Chemical name
 * @property {string} cas_number - CAS number
 * @property {string} molecular_formula - Molecular formula
 * @property {number} molecular_weight - Molecular weight
 * @property {number} purity - Purity percentage
 * @property {string} supplier - Supplier name
 * @property {string} lot_number - Lot number
 * @property {string} expiry_date - Expiry date
 * @property {string} storage_location - Storage location
 * @property {number} quantity - Quantity
 * @property {string} unit - Unit of measurement
 * @property {string} hazard_classification - Hazard classification
 * @property {string} [safety_data_sheet_url] - Safety data sheet URL (optional)
 * @property {string} [notes] - Additional notes (optional)
 */

/**
 * @typedef {Object} Formulation
 * @property {number} id - Formulation ID
 * @property {string} name - Formulation name
 * @property {string} description - Description
 * @property {number} created_by - Creator user ID
 * @property {string} created_at - Creation timestamp
 * @property {string} updated_at - Last update timestamp
 * @property {boolean} is_active - Active status
 * @property {FormulationChemical[]} chemicals - List of chemicals in formulation
 */

/**
 * @typedef {Object} FormulationChemical
 * @property {number} id - Formulation chemical ID
 * @property {number} formulation_id - Formulation ID
 * @property {number} chemical_id - Chemical ID
 * @property {number} quantity - Quantity
 * @property {string} unit - Unit of measurement
 * @property {Chemical} chemical - Chemical object
 */

/**
 * @typedef {Object} Notification
 * @property {number} id - Notification ID
 * @property {number} user_id - User ID
 * @property {string} title - Notification title
 * @property {string} message - Notification message
 * @property {string} type - Notification type
 * @property {boolean} is_read - Read status
 * @property {string} created_at - Creation timestamp
 * @property {string} [related_entity_type] - Related entity type (optional)
 * @property {number} [related_entity_id] - Related entity ID (optional)
 */

/**
 * Notification types enum
 */
export const NotificationType = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  SUCCESS: 'success'
};

/**
 * @typedef {Object} Alert
 * @property {number} id - Alert ID
 * @property {string} title - Alert title
 * @property {string} message - Alert message
 * @property {string} type - Alert type
 * @property {string} severity - Alert severity
 * @property {boolean} is_active - Active status
 * @property {string} created_at - Creation timestamp
 * @property {string} updated_at - Last update timestamp
 * @property {string} [expires_at] - Expiration timestamp (optional)
 */

/**
 * Alert types enum
 */
export const AlertType = {
  CHEMICAL_EXPIRY: 'chemical_expiry',
  LOW_STOCK: 'low_stock',
  SYSTEM_MAINTENANCE: 'system_maintenance',
  SECURITY: 'security'
};

/**
 * Alert severity enum
 */
export const AlertSeverity = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

/**
 * @typedef {Object} ActivityLog
 * @property {number} id - Activity log ID
 * @property {number} user_id - User ID
 * @property {string} action - Action performed
 * @property {string} description - Description
 * @property {string} [note] - Additional note (optional)
 * @property {string} created_at - Creation timestamp
 * @property {User} user - User object
 */

/**
 * @typedef {Object} AccountTransaction
 * @property {number} id - Transaction ID
 * @property {number} user_id - User ID
 * @property {string} transaction_type - Transaction type
 * @property {number} amount - Transaction amount
 * @property {string} description - Description
 * @property {string} [reference] - Reference (optional)
 * @property {string} created_at - Creation timestamp
 * @property {User} user - User object
 */

/**
 * Transaction types enum
 */
export const TransactionType = {
  CREDIT: 'credit',
  DEBIT: 'debit'
};

/**
 * @typedef {Object} ApiResponse
 * @template T
 * @property {boolean} success - Success status
 * @property {T} [data] - Response data (optional)
 * @property {string} [message] - Response message (optional)
 * @property {string} [error] - Error message (optional)
 */

/**
 * @typedef {Object} PaginatedResponse
 * @template T
 * @property {T[]} items - Array of items
 * @property {number} total - Total count
 * @property {number} page - Current page
 * @property {number} per_page - Items per page
 * @property {number} total_pages - Total pages
 */

/**
 * @typedef {Object} LoginFormData
 * @property {string} firebase_token - Firebase token
 */

/**
 * @typedef {Object} RegisterFormData
 * @property {string} email - Email address
 * @property {string} password - Password
 * @property {string} first_name - First name
 * @property {string} [last_name] - Last name (optional)
 * @property {string} [phone] - Phone number (optional)
 */

/**
 * @typedef {Object} OTPFormData
 * @property {string} phone_number - Phone number
 * @property {string} [otp_code] - OTP code (optional)
 */

// Export all enums and constants
export {
  UserRole,
  NotificationType,
  AlertType,
  AlertSeverity,
  TransactionType
}; 
