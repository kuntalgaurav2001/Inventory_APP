#!/usr/bin/env python3

from app.database import engine
from app.models.notifications import Notification
from sqlalchemy import text

def reset_notifications_table():
    try:
        with engine.connect() as conn:
            conn.execute(text("DROP TABLE IF EXISTS notifications CASCADE"))
            conn.commit()
            print("✅ Dropped existing notifications table")
        Notification.metadata.create_all(bind=engine)
        print("✅ Recreated notifications table with new schema")
    except Exception as e:
        print(f"❌ Error resetting notifications table: {e}")
        raise

if __name__ == "__main__":
    reset_notifications_table() 
