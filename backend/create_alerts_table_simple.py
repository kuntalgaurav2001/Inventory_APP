#!/usr/bin/env python3
"""
Simple script to create alerts table.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, text
from app.database import DATABASE_URL

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
            return True
        except Exception as e:
            print(f"❌ Error creating alerts table: {e}")
            return False

def main():
    print("🚀 Creating alerts table...")
    
    if create_alerts_table():
        print("🎉 Alerts table creation completed successfully!")
        print("\n💡 Next steps:")
        print("- Restart your backend server")
        print("- The alerts table is now ready for use")
        print("- System alerts will be created in the alerts table going forward")
    else:
        print("❌ Failed to create alerts table.")

if __name__ == "__main__":
    main() 
