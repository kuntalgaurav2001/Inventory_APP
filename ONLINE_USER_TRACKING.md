# Online User Tracking Feature

This document explains how the online user tracking feature works in the Chemical Inventory Management System.

## Overview

The system now tracks which users are currently active/online by monitoring their last activity timestamp. This feature helps administrators see who is currently using the system.

## How It Works

### 1. Database Changes
- Added `last_seen` column to the `users` table
- This column stores a timestamp of when the user was last active

### 2. Backend Implementation

#### User Model Updates
- Added `last_seen` field to track user activity
- Field is nullable and defaults to `None`

#### API Endpoints
- `POST /user/ping` - Updates user's last seen timestamp (heartbeat)
- `GET /admin/online-users` - Returns list of currently online users (admin only)

#### CRUD Functions
- `update_user_last_seen()` - Updates user's last seen timestamp
- `get_online_users()` - Gets users active in the last N minutes

### 3. Frontend Implementation

#### Heartbeat System
- Automatically sends ping requests every 2 minutes when user is logged in
- Updates user's last seen timestamp to keep them marked as "online"
- Stops when user logs out or closes the browser

#### Admin Interface
- New "Online Users" tab in admin management
- Shows users who were active in the last 5 minutes
- Auto-refreshes every 30 seconds when viewing the tab
- Manual refresh button available

#### Visual Indicators
- 🟢 Online - User was active in the last 5 minutes
- ⚫ Offline - User hasn't been active for more than 5 minutes
- Added to all user tables (Users, Lab Staff, Product Team, Account Team)

## Configuration

### Online Threshold
- Default: 5 minutes
- Configurable via API parameter: `minutes_threshold`
- Range: 1-60 minutes

### Heartbeat Frequency
- Default: Every 2 minutes
- Configurable in `AuthContext.js`

### Auto-refresh Frequency
- Default: Every 30 seconds (Online Users tab only)
- Configurable in `AdminManagementPage.js`

## Usage

### For Administrators
1. Navigate to Admin Management
2. Click on "Online Users" tab
3. View currently active users
4. Use refresh button for manual updates
5. See online status in all user tables

### For Users
- No action required
- System automatically tracks activity
- Users remain "online" as long as they have the app open

## Technical Details

### Database Migration
Run the migration script to add the `last_seen` column:
```bash
cd backend
python add_last_seen_column.py
```

### API Endpoints

#### Update Last Seen
```http
POST /user/ping
Authorization: Bearer <firebase_token>
```

#### Get Online Users
```http
GET /admin/online-users?minutes_threshold=5
Authorization: Bearer <firebase_token>
```

### Response Format
```json
{
  "id": 1,
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "role": "lab_staff",
  "is_approved": true,
  "last_seen": "2024-01-01T12:00:00Z"
}
```
## Security Considerations

- Only approved users send heartbeat requests
- Admin-only access to online users list
- Heartbeat requests are lightweight and don't expose sensitive data
- Online status is based on activity, not just login status

## Troubleshooting

### Users Not Showing as Online
1. Check if user is approved
2. Verify heartbeat is working (check browser console)
3. Check backend server is running
4. Verify database connection

### Performance Considerations
- Heartbeat requests are minimal overhead
- Online users query is optimized with database indexes
- Auto-refresh only runs when viewing Online Users tab

## Future Enhancements

- Real-time updates using WebSockets
- More detailed activity tracking
- User presence indicators in chat/communication features
- Activity analytics and reporting 
