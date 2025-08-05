#!/usr/bin/env python3
"""
Migration script to add is_online boolean column to users table.
"""
import sys
import os
from sqlalchemy import text

# Add the parent directory to the path so we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal

def migrate_is_online():
    print("🔧 Adding is_online column to users table...")
    db = SessionLocal()
    try:
        # Check if column already exists
        result = db.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'is_online'
        """))
        if result.fetchone():
            print("✅ is_online column already exists")
            return
        # Add the column
        db.execute(text("""
            ALTER TABLE users 
            ADD COLUMN is_online BOOLEAN DEFAULT FALSE
        """))
        db.commit()
        print("✅ is_online column added successfully")
    except Exception as e:
        print(f"❌ Error adding is_online column: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    migrate_is_online() 

