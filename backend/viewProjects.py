import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, Column, Integer, TEXT
from sqlalchemy.orm import sessionmaker, declarative_base

def view_all_projects():
    """
    Connects to the database, queries all projects from the
    'existing_projects' table, and prints them to the console.
    """
    # --- 1. SETUP AND CONNECTION ---
    load_dotenv()
    db_url = os.getenv("DATABASE_URL")

    if not db_url:
        print("❌ Error: DATABASE_URL not found in .env file.")
        return

    print("Connecting to the database...")
    try:
        engine = create_engine(db_url)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        Base = declarative_base()
    except Exception as e:
        print(f"❌ Error creating database engine: {e}")
        return

    # --- 2. DEFINE THE TABLE MODEL TO MATCH THE DATABASE ---
    class ExistingProject(Base):
        __tablename__ = 'existing_projects'
        # Define the columns to match the table structure
        id = Column(Integer, primary_key=True)
        title = Column(TEXT, nullable=False)
        synopsis = Column(TEXT)

    # --- 3. QUERY AND DISPLAY DATA ---
    db = SessionLocal()
    try:
        print("Fetching projects from the database...")
        # Query the database to get all records from the table
        all_projects = db.query(ExistingProject).order_by(ExistingProject.id).all()

        if not all_projects:
            print("\n⚠️ No projects found in the 'existing_projects' table.")
            return

        print("\n--- List of Seeded Projects ---")
        # Loop through the results and print each one
        for project in all_projects:
            print(f"[{project.id:02d}]: {project.title}")
        print("------------------------------")
        print(f"✅ Successfully retrieved {len(all_projects)} projects.")

    except Exception as e:
        print(f"❌ An error occurred while fetching data: {e}")
    finally:
        db.close()
        print("\nDatabase connection closed.")


# --- 4. RUN THE SCRIPT ---
if __name__ == "__main__":
    view_all_projects()
