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

    print("Attempting to connect to the database...")

    try:
        # Create a SQLAlchemy engine
        engine = create_engine(db_url)

        # Try to establish a connection
        with engine.connect() as connection:
            print("✅ Connection Successful!")
            print(f"PostgreSQL Version: {connection.dialect.server_version_info}")

    except OperationalError as e:
        print("\n❌ Connection Failed. Please check your credentials and network.")
        print(f"Error details: {e}")
    except Exception as e:
        print(f"\nAn unexpected error occurred: {e}")


# --- ADD THIS BLOCK ---
# This part actually runs the function when you execute the file.
if __name__ == "__main__":
    test_db_connection()