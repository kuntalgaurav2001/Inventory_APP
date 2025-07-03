import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Plus, 
  Filter, 
  Search, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  X,
  Edit3,
  Trash2,
  Send
} from 'lucide-react';
import { 
  fetchNotifications, 
  sendNotification, 
  updateNotification, 
  deleteNotification,
  markNotificationRead,
  dismissNotification,
  fetchNotificationCategories,
  fetchNotificationPriorities,
  fetchNotificationStatuses
} from '../api/notifications';
import { useAuth } from '../context/AuthContext';
import styles from './NotificationDashboard.module.scss';

const ROLE_TABS = [
  { key: 'all', label: 'All Notifications' },
  { key: 'admin', label: 'Admin' },
  { key: 'lab_staff', label: 'Lab Staff' },
  { key: 'product', label: 'Product Team' },
  { key: 'account', label: 'Account Team' },
  { key: 'all_users', label: 'All Users' },
];

const NotificationDashboard = () => {
  const { userInfo } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [categories, setCategories] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    type: '',
    severity: 'info',
    message: '',
    category: 'general',
    priority: 'mid',
    recipients: ['admin']
  });

  useEffect(() => {
    loadNotifications();
    loadDropdownData();
  }, [filters]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await fetchNotifications(filters);
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDropdownData = async () => {
    try {
      const [categoriesData, prioritiesData, statusesData] = await Promise.all([
        fetchNotificationCategories(),
        fetchNotificationPriorities(),
        fetchNotificationStatuses()
      ]);
      setCategories(categoriesData);
      setPriorities(prioritiesData);
      setStatuses(statusesData);
    } catch (error) {
      console.error('Error loading dropdown data:', error);
    }
  };

  const handleCreateNotification = async (e) => {
    e.preventDefault();
    try {
      await sendNotification(formData);
      setFormData({
        type: '',
        severity: 'info',
        message: '',
        category: 'general',
        priority: 'mid',
        recipients: ['admin']
      });
      setShowCreateForm(false);
      loadNotifications();
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  const handleUpdateStatus = async (notificationId, newStatus) => {
    try {
      await updateNotification(notificationId, { status: newStatus });
      loadNotifications();
    } catch (error) {
      console.error('Error updating notification status:', error);
    }
  };

  const handleMarkRead = async (notificationId) => {
    try {
      await markNotificationRead(notificationId);
      loadNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleDismiss = async (notificationId) => {
    try {
      await dismissNotification(notificationId);
      loadNotifications();
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  };

  const handleDelete = async (notificationId) => {
    setNotificationToDelete(notificationId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!notificationToDelete) return;
    try {
      await deleteNotification(notificationToDelete);
      setShowDeleteModal(false);
      setNotificationToDelete(null);
      loadNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
      setShowDeleteModal(false);
      setNotificationToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setNotificationToDelete(null);
  };

  // Helper: can the current user act on this notification?
  const canActOnNotification = (notification) => {
    if (!userInfo) return false;
    if (userInfo.role === 'admin') return true;
    return notification.recipients && notification.recipients.includes(userInfo.role);
  };

  // Filtering logic for notifications
  let visibleNotifications = notifications;
  if (userInfo && userInfo.role !== 'admin') {
    visibleNotifications = notifications.filter(n => n.recipients && n.recipients.includes(userInfo.role));
  }

  // Tab filtering logic (only for admin)
  const getTabFilteredNotifications = () => {
    if (!userInfo || userInfo.role !== 'admin') return visibleNotifications;
    if (activeTab === 'all') return visibleNotifications;
    return visibleNotifications.filter(n => n.recipients && n.recipients.includes(activeTab));
  };

  const filteredNotifications = getTabFilteredNotifications().filter(notification =>
    notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notification.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (notification.creator_name && notification.creator_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#dc3545';
      case 'mid': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#28a745';
      case 'in_progress': return '#17a2b8';
      case 'pending': return '#ffc107';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return <AlertTriangle size={16} color="red" />;
      case 'warning': return <AlertTriangle size={16} color="orange" />;
      case 'info': return <Bell size={16} color="blue" />;
      default: return <Bell size={16} />;
    }
  };

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>Notification Dashboard</h1>
          <p>Manage and create notifications for your team</p>
        </div>
        <div className={styles.headerRight}>
          <button 
            className={styles.createButton}
            onClick={() => setShowCreateForm(true)}
          >
            <Plus size={16} />
            Create Notification
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className={styles.controls}>
        <div className={styles.searchSection}>
          <div className={styles.searchBox}>
            <Search size={16} />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            className={styles.filterButton}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className={styles.filtersPanel}>
            <div className={styles.filterRow}>
              <select
                value={filters.category || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value || undefined }))}
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>

              <select
                value={filters.priority || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value || undefined }))}
              >
                <option value="">All Priorities</option>
                {priorities.map(pri => (
                  <option key={pri.value} value={pri.value}>{pri.label}</option>
                ))}
              </select>

              <select
                value={filters.status || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value || undefined }))}
              >
                <option value="">All Statuses</option>
                {statuses.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>

              <select
                value={filters.severity || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value || undefined }))}
              >
                <option value="">All Severities</option>
                <option value="critical">Critical</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Tabs (only visible to admin, moved below filter/search) */}
      {userInfo?.role === 'admin' && (
        <div className={styles.tabs}>
          {ROLE_TABS.map(tab => (
            <button
              key={tab.key}
              className={activeTab === tab.key ? styles.activeTab : styles.tab}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Notifications List */}
      <div className={styles.notificationsList}>
        {loading ? (
          <div className={styles.loading}>Loading notifications...</div>
        ) : filteredNotifications.length === 0 ? (
          <div className={styles.emptyState}>
            <Bell size={48} />
            <h3>No notifications found</h3>
            <p>Create your first notification or adjust your filters</p>
          </div>
        ) : (
          filteredNotifications.map(notification => (
            <div 
              key={notification.id} 
              className={`${styles.notificationCard} ${!notification.is_read ? styles.unread : ''}`}
            >
              <div className={styles.notificationHeader}>
                <div className={styles.notificationMeta}>
                  {getSeverityIcon(notification.severity)}
                  <span className={styles.notificationType}>{notification.type}</span>
                  <span 
                    className={styles.priority}
                    style={{ backgroundColor: getPriorityColor(notification.priority) }}
                  >
                    {notification.priority.toUpperCase()}
                  </span>
                  <span 
                    className={styles.status}
                    style={{ backgroundColor: getStatusColor(notification.status) }}
                  >
                    {notification.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div className={styles.notificationActions}>
                  {/* Only show action buttons if user can act on this notification */}
                  {canActOnNotification(notification) && !notification.is_read && (
                    <button 
                      onClick={() => handleMarkRead(notification.id)}
                      className={styles.actionButton}
                      title="Mark as read"
                    >
                      <Eye size={14} />
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      setSelectedNotification(notification);
                      setShowDetailModal(true);
                    }}
                    className={styles.actionButton}
                    title="View details"
                  >
                    <Eye size={14} />
                  </button>
                  {canActOnNotification(notification) && (
                    <button 
                      onClick={() => handleDismiss(notification.id)}
                      className={styles.actionButton}
                      title="Dismiss"
                    >
                      <X size={14} />
                    </button>
                  )}
                  {userInfo?.role === 'admin' && (
                    <button 
                      onClick={() => handleDelete(notification.id)}
                      className={`${styles.actionButton} ${styles.deleteButton}`}
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              <div className={styles.notificationContent}>
                <p className={styles.message}>{notification.message}</p>
                <div className={styles.notificationDetails}>
                  <span className={styles.category}>{notification.category}</span>
                  <span className={styles.creator}>
                    Created by: {notification.creator_name || 'Unknown'}
                  </span>
                  <span className={styles.timestamp}>
                    {new Date(notification.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Only allow status change if user can act on this notification */}
              {canActOnNotification(notification) && (
                <div className={styles.statusActions}>
                  <select
                    value={notification.status}
                    onChange={(e) => handleUpdateStatus(notification.id, e.target.value)}
                    className={styles.statusSelect}
                  >
                    {statuses.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Create Notification Modal */}
      {showCreateForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Create New Notification</h2>
              <button 
                onClick={() => setShowCreateForm(false)}
                className={styles.closeButton}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateNotification} className={styles.createForm}>
              <div className={styles.formRow}>
                <label>Type:</label>
                <input
                  type="text"
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  placeholder="e.g., Low Stock Alert"
                  required
                />
              </div>

              <div className={styles.formRow}>
                <label>Message:</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Enter notification message..."
                  required
                  rows={3}
                />
              </div>

              <div className={styles.formRow}>
                <label>Category:</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formRow}>
                <label>Priority:</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                >
                  {priorities.map(pri => (
                    <option key={pri.value} value={pri.value}>{pri.label}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formRow}>
                <label>Severity:</label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData(prev => ({ ...prev, severity: e.target.value }))}
                >
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div className={styles.formRow}>
                <label>Recipients:</label>
                <select
                  value={formData.recipients[0]}
                  onChange={(e) => setFormData(prev => ({ ...prev, recipients: [e.target.value] }))}
                >
                  <option value="admin">Admin</option>
                  <option value="lab_staff">Lab Staff</option>
                  <option value="product">Product Team</option>
                  <option value="account">Account Team</option>
                  <option value="all_users">All Users</option>
                </select>
              </div>

              <div className={styles.formActions}>
                <button type="button" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.submitButton}>
                  <Send size={16} />
                  Send Notification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notification Detail Modal */}
      {showDetailModal && selectedNotification && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Notification Details</h2>
              <button 
                onClick={() => setShowDetailModal(false)}
                className={styles.closeButton}
              >
                <X size={20} />
              </button>
            </div>
            <div className={styles.detailContent}>
              <div className={styles.detailRow}>
                <strong>Type:</strong>
                <span>{selectedNotification.type}</span>
              </div>
              <div className={styles.detailRow}>
                <strong>Message:</strong>
                <span>{selectedNotification.message}</span>
              </div>
              <div className={styles.detailRow}>
                <strong>Category:</strong>
                <span>{selectedNotification.category}</span>
              </div>
              <div className={styles.detailRow}>
                <strong>Priority:</strong>
                <span style={{ color: getPriorityColor(selectedNotification.priority) }}>
                  {selectedNotification.priority.toUpperCase()}
                </span>
              </div>
              <div className={styles.detailRow}>
                <strong>Status:</strong>
                <span style={{ color: getStatusColor(selectedNotification.status) }}>
                  {selectedNotification.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <div className={styles.detailRow}>
                <strong>Severity:</strong>
                <span>{selectedNotification.severity}</span>
              </div>
              <div className={styles.detailRow}>
                <strong>Created by:</strong>
                <span>{selectedNotification.creator_name || 'Unknown'}</span>
              </div>
              <div className={styles.detailRow}>
                <strong>Created at:</strong>
                <span>{new Date(selectedNotification.timestamp).toLocaleString()}</span>
              </div>
              <div className={styles.detailRow}>
                <strong>Recipients:</strong>
                <span>{selectedNotification.recipients.join(', ')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Delete Notification</h2>
              <button onClick={cancelDelete} className={styles.closeButton}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.detailContent}>
              <p>Are you sure you want to delete this notification?</p>
            </div>
            <div className={styles.formActions}>
              <button onClick={cancelDelete}>
                Cancel
              </button>
              <button onClick={confirmDelete} className={styles.deleteButton}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDashboard; 