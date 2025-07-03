const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000';

// Helper to get auth header
const getAuthHeaders = () => {
  const token = localStorage.getItem('firebase_token');
  return token ? { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  } : {};
};

// Send notification
export const sendNotification = async (notificationData) => {
  const response = await fetch(`${API_BASE}/notifications/send`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(notificationData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to send notification');
  }

  return response.json();
};

// Get notifications with filters
export const fetchNotifications = async (filters = {}) => {
  const queryParams = new URLSearchParams();
  
  // Add filter parameters
  Object.keys(filters).forEach(key => {
    if (filters[key] !== undefined && filters[key] !== null) {
      queryParams.append(key, filters[key]);
    }
  });
  
  const response = await fetch(`${API_BASE}/notifications?${queryParams.toString()}`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch notifications');
  }

  return response.json();
};

// Get unread notifications
export const fetchUnreadNotifications = async () => {
  const response = await fetch(`${API_BASE}/notifications/unread`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch unread notifications');
  }

  return response.json();
};

// Get active notifications
export const fetchActiveNotifications = async () => {
  const response = await fetch(`${API_BASE}/notifications/active`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch active notifications');
  }

  return response.json();
};

// Dismiss notification
export const dismissNotification = async (notificationId) => {
  const response = await fetch(`${API_BASE}/notifications/${notificationId}/dismiss`, {
    method: 'POST',
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to dismiss notification');
  }

  return response.json();
};

// Mark notification as read
export const markNotificationRead = async (notificationId) => {
  const response = await fetch(`${API_BASE}/notifications/${notificationId}/read`, {
    method: 'POST',
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to mark notification as read');
  }

  return response.json();
};

// Update notification
export const updateNotification = async (notificationId, updateData) => {
  const response = await fetch(`${API_BASE}/notifications/${notificationId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updateData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to update notification');
  }

  return response.json();
};

// Delete notification (admin only)
export const deleteNotification = async (notificationId) => {
  const response = await fetch(`${API_BASE}/notifications/${notificationId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to delete notification');
  }

  return response.json();
};

// Get notification categories
export const fetchNotificationCategories = async () => {
  const response = await fetch(`${API_BASE}/notifications/categories/list`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch notification categories');
  }

  return response.json();
};

// Get notification priorities
export const fetchNotificationPriorities = async () => {
  const response = await fetch(`${API_BASE}/notifications/priorities/list`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch notification priorities');
  }

  return response.json();
};

// Get notification statuses
export const fetchNotificationStatuses = async () => {
  const response = await fetch(`${API_BASE}/notifications/statuses/list`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch notification statuses');
  }

  return response.json();
}; 