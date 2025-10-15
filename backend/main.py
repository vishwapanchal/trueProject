import os
from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, TEXT
from sqlalchemy.orm import sessionmaker, Session, declarative_base
from pydantic import BaseModel
from typing import List, Optional

# --- 1. SETUP AND CONFIGURATION ---

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise Exception("DATABASE_URL not found in .env file.")

app = FastAPI(
    title="Project API",
    description="A complete CRUD API for managing projects.",
    version="1.0.0",
)

# --- CORS Middleware ---
origins = ["http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Database Setup ---
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# --- 2. DATABASE MODEL (SQLAlchemy) ---
class ExistingProject(Base):
    __tablename__ = 'existing_projects'
    id = Column(Integer, primary_key=True, index=True)
    title = Column(TEXT, nullable=False, index=True)
    synopsis = Column(TEXT, nullable=True)

# --- 3. DATA VALIDATION MODELS (Pydantic) ---
class ProjectBase(BaseModel):
    title: str
    synopsis: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    synopsis: Optional[str] = None

class Project(ProjectBase):
    id: int
    class Config:
        from_attributes = True

# --- 4. DATABASE SESSION DEPENDENCY ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- 5. CRUD API ENDPOINTS ---

@app.post("/projects/", response_model=Project, status_code=201)
def create_project(project: ProjectCreate, db: Session = Depends(get_db)):
    db_project = ExistingProject(title=project.title, synopsis=project.synopsis)
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@app.get("/projects/", response_model=List[Project])
def read_all_projects(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    projects = db.query(ExistingProject).offset(skip).limit(limit).all()
    return projects

@app.get("/projects/{project_id}", response_model=Project)
def read_project(project_id: int, db: Session = Depends(get_db)):
    db_project = db.query(ExistingProject).filter(ExistingProject.id == project_id).first()
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return db_project

@app.put("/projects/{project_id}", response_model=Project)
def update_project(project_id: int, project: ProjectUpdate, db: Session = Depends(get_db)):
    db_project = db.query(ExistingProject).filter(ExistingProject.id == project_id).first()
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")

    update_data = project.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_project, key, value)

    db.commit()
    db.refresh(db_project)
    return db_project

@app.delete("/projects/{project_id}", status_code=204)
def delete_project(project_id: int, db: Session = Depends(get_db)):
    db_project = db.query(ExistingProject).filter(ExistingProject.id == project_id).first()
    if db_project is None:
        raise HTTPException(status_code=404, detail="Project not found")

    db.delete(db_project)
    db.commit()
    return {"detail": "Project deleted successfully"}

