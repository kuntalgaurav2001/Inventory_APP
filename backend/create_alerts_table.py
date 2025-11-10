#!/usr/bin/env python3
"""
Script to create alerts table and migrate existing system alerts from notifications table.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, text
from app.database import DATABASE_URL
import json

def create_alerts_table():
    """Create the alerts table"""
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        # Create alerts table
        create_table_sql = """
        CREATE TABLE IF NOT EXISTS alerts (
            id SERIAL PRIMARY KEY,
            type VARCHAR(50) NOT NULL,
            severity VARCHAR(50) NOT NULL,
            message TEXT NOT NULL,
            chemical_id INTEGER REFERENCES chemical_inventory(id),
            user_id VARCHAR(255) REFERENCES users(uid),
            timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            is_dismissed BOOLEAN DEFAULT FALSE,
            is_read BOOLEAN DEFAULT FALSE
        );
        """
        
        try:
            conn.execute(text(create_table_sql))
            conn.commit()
            print("✅ Alerts table created successfully!")
        except Exception as e:
            print(f"❌ Error creating alerts table: {e}")
            return False
    
    return True

def migrate_system_alerts():
    """Migrate existing system alerts from notifications table to alerts table"""
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        # Get system alerts from notifications table
        select_sql = """
        SELECT id, type, severity, message, chemical_id, user_id, timestamp, is_dismissed, is_read
        FROM notifications 
        WHERE type IN ('low_stock', 'out_of_stock', 'expiry')
        """
        
        try:
            result = conn.execute(text(select_sql))
            system_alerts = result.fetchall()
            
            if not system_alerts:
                print("ℹ️  No system alerts found to migrate.")
                return True
            
            print(f"📦 Found {len(system_alerts)} system alerts to migrate...")
            
            # Insert into alerts table
            insert_sql = """
            INSERT INTO alerts (type, severity, message, chemical_id, user_id, timestamp, is_dismissed, is_read)
            VALUES (:type, :severity, :message, :chemical_id, :user_id, :timestamp, :is_dismissed, :is_read)
            """
            
            migrated_count = 0
            for alert in system_alerts:
                try:
                    conn.execute(text(insert_sql), {
                        'type': alert.type,
                        'severity': alert.severity,
                        'message': alert.message,
                        'chemical_id': alert.chemical_id,
                        'user_id': alert.user_id,
                        'timestamp': alert.timestamp,
                        'is_dismissed': alert.is_dismissed,
                        'is_read': alert.is_read
                    })
                    migrated_count += 1
                except Exception as e:
                    print(f"⚠️  Error migrating alert {alert.id}: {e}")
            
            conn.commit()
            print(f"✅ Successfully migrated {migrated_count} system alerts!")
            
            # Delete migrated alerts from notifications table
            delete_sql = """
            DELETE FROM notifications 
            WHERE type IN ('low_stock', 'out_of_stock', 'expiry')
            """
            
            conn.execute(text(delete_sql))
            conn.commit()
            print("✅ Cleaned up system alerts from notifications table!")
            
        except Exception as e:
            print(f"❌ Error during migration: {e}")
            return False
    
    return True

def main():
    print("🚀 Starting alerts table creation and migration...")
    
    # Create alerts table
    if not create_alerts_table():
        print("❌ Failed to create alerts table. Exiting.")
        return
    
    # Migrate existing system alerts
    if not migrate_system_alerts():
        print("❌ Failed to migrate system alerts. Exiting.")
        return
    
    print("🎉 Alerts table creation and migration completed successfully!")
    print("\n📋 Summary:")
    print("- Created new 'alerts' table")
    print("- Migrated system alerts from 'notifications' table")
    print("- Cleaned up notifications table")
    print("\n💡 Next steps:")
    print("- Restart your backend server")
    print("- Update frontend to use /alerts endpoint for system alerts")
    print("- Use /notifications endpoint only for user-created notifications")

if __name__ == "__main__":
    main() 

