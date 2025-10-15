# test_connection.py
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.exc import OperationalError

def test_db_connection():
    """
    Tests the connection to the Supabase database.
    """
    # Load the environment variables from the .env file
    load_dotenv()
    db_url = os.getenv("DATABASE_URL")

    # Check if the database URL is loaded
    if not db_url:
        print("❌ Error: DATABASE_URL not found. Make sure you have a .env file with the correct variable.")
        return