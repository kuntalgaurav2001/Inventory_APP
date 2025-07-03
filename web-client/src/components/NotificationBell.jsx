import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { fetchUnreadNotifications } from '../api/notifications';
import styles from './NotificationBell.module.scss';

const NotificationBell = ({ onOpenDashboard }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUnreadCount();
    // Refresh unread count every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadUnreadCount = async () => {
    setLoading(true);
    try {
      const notifications = await fetchUnreadNotifications();
      setUnreadCount(notifications.length);
    } catch (error) {
      console.error('Error loading unread notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    if (onOpenDashboard) {
      onOpenDashboard();
    }
  };

  return (
    <div className={styles.notificationBell} onClick={handleClick}>
      <Bell size={20} />
      {/* Show badge only if there are unread notifications */}
      {unreadCount > 0 && (
        <span className={styles.badge}>
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
      {loading && <div className={styles.loadingDot} />}
    </div>
  );
};

export default NotificationBell; 