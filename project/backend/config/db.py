import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# MySQL connection setup
def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host=os.getenv("DB_HOST", "localhost"),  # Default to localhost
            user=os.getenv("DB_USER", "root"),
            password=os.getenv("DB_PASS", ""),
            database=os.getenv("DB_NAME", "policeapp_users")
        )
        
        if connection.is_connected():
            print("✅ Connected to MySQL")
            return connection
    except Error as e:
        print(f"❌ MySQL connection failed: {e}")
        return None