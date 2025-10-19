import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

def run_migration():
    """
    Connects to the database and applies necessary schema changes
    without deleting existing data. This is a simple migration script.
    """
    print("Starting database migration...")
    
    # --- 1. Load Configuration ---
    load_dotenv()
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("❌ Error: DATABASE_URL not found in .env file.")
        return

    # --- 2. Connect to the Database ---
    try:
        engine = create_engine(db_url)
        connection = engine.connect()
        print("✅ Database connection successful.")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return

    # --- 3. Define SQL Commands to be Executed ---
    # These commands are designed to be safe to run multiple times.
    commands = [
        # Enable the vector extension for embeddings
        "CREATE EXTENSION IF NOT EXISTS vector;",
        
        # Create the 'users' table if it doesn't already exist
        """
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            hashed_password TEXT NOT NULL,
            role VARCHAR(50) NOT NULL
        );
        """,
        
        # Add the new columns to 'existing_projects' if they don't exist
        "ALTER TABLE existing_projects ADD COLUMN IF NOT EXISTS embedding vector(1536);",
        "ALTER TABLE existing_projects ADD COLUMN IF NOT EXISTS owner_id INTEGER REFERENCES users(id);",
        
        # Create the 'assigned_projects' association table for mentors
        """
        CREATE TABLE IF NOT EXISTS assigned_projects (
            user_id INTEGER REFERENCES users(id),
            project_id INTEGER REFERENCES existing_projects(id),
            PRIMARY KEY (user_id, project_id)
        );
        """
    ]

    # --- 4. Execute the Commands ---
    try:
        with connection.begin() as transaction:
            for command in commands:
                print(f"Executing: {command.strip().splitlines()[0]}...")
                connection.execute(text(command))
        print("\n✅ Migration completed successfully!")
    except Exception as e:
        print(f"\n❌ An error occurred during migration: {e}")
        transaction.rollback()
    finally:
        connection.close()
        print("Database connection closed.")


if __name__ == "__main__":
    run_migration()
