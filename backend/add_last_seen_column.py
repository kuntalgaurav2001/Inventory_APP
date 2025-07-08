#!/usr/bin/env python3
"""
Script to add last_seen column to users table
"""

import sys
import os
from sqlalchemy import text

# Add the parent directory to the path so we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal

def add_last_seen_column():
    """Add last_seen column to users table"""
    print("🔧 Adding last_seen column to users table...")
    
    db = SessionLocal()
    try:
        # Check if column already exists
        result = db.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'last_seen'
        """))
        
        if result.fetchone():
            print("✅ last_seen column already exists")
            return
        
        # Add the column
        db.execute(text("""
            ALTER TABLE users 
            ADD COLUMN last_seen TIMESTAMP WITH TIME ZONE
        """))
        
        db.commit()
        print("✅ last_seen column added successfully")
        
        # Update existing users with current timestamp as last_seen
        db.execute(text("""
            UPDATE users 
            SET last_seen = updated_at 
            WHERE last_seen IS NULL
        """))
        
        db.commit()
        print("✅ Updated existing users with current timestamp as last_seen")
        
    except Exception as e:
        print(f"❌ Error adding last_seen column: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    add_last_seen_column() 