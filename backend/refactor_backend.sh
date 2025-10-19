#!/bin/bash

# --- Automated Backend Refactoring Script (v25 - Weather Endpoint) ---

echo "Starting backend refactor for Weather Endpoint..."

# 1. Add new dependency to requirements.txt
if ! grep -q "httpx" requirements.txt; then
  echo "Adding httpx to requirements.txt"
  echo "httpx" >> requirements.txt
fi

# 2. Ensure directory structure is correct
mkdir -p app/routers
touch app/__init__.py app/routers/__init__.py

# 3. Create/Overwrite module files
echo "Creating/updating module files..."

# (The following files are unchanged but included for completeness)
# --- app/database.py ---
cat > app/database.py << 'EOL'
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise Exception("DATABASE_URL not found in .env file.")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
EOL
# --- app/models.py ---
cat > app/models.py << 'EOL'
from sqlalchemy import Column, Integer, String, TEXT, ForeignKey, Table
from sqlalchemy.orm import relationship
from .database import Base
from pgvector.sqlalchemy import Vector

assigned_projects_table = Table(
    'assigned_projects',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True),
    Column('project_id', Integer, ForeignKey('existing_projects.id'), primary_key=True)
)

class ProjectDB(Base):
    __tablename__ = 'existing_projects'
    id = Column(Integer, primary_key=True, index=True)
    title = Column(TEXT, nullable=False)
    synopsis = Column(TEXT)
    embedding = Column(Vector(1536), nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String, default='pending', nullable=False)

    owner = relationship("UserDB", foreign_keys=[owner_id], back_populates="owned_projects")
    mentors = relationship("UserDB", secondary=assigned_projects_table, back_populates="mentored_projects")

class UserDB(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False)
    
    owned_projects = relationship("ProjectDB", foreign_keys=[ProjectDB.owner_id], back_populates="owner")
    mentored_projects = relationship("ProjectDB", secondary=assigned_projects_table, back_populates="mentors")
EOL
# --- app/schemas.py ---
cat > app/schemas.py << 'EOL'
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List

class ProjectBase(BaseModel):
    title: str
    synopsis: Optional[str] = None

class ProjectCreate(ProjectBase):
    mentor_email: Optional[EmailStr] = None

class ProjectUpdate(ProjectBase): pass

class Project(ProjectBase):
    id: int
    owner_id: Optional[int] = None
    status: str
    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    email: str
    password: str
    role: str = Field(..., pattern="^(teacher|student)$")

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

class OriginalityCheckRequest(BaseModel):
    title: str
    synopsis: Optional[str] = ""

class SimilarProject(BaseModel):
    id: int
    title: str
    similarity_score: float

class OriginalityCheckResponse(BaseModel):
    is_original: bool
    message: str
    similar_projects: List[SimilarProject] = []
EOL
# --- app/security.py ---
cat > app/security.py << 'EOL'
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
import openai
import os
from . import models, database

SECRET_KEY = "your_super_secret_random_string_for_jwt"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
openai.api_key = os.getenv("OPENAI_API_KEY")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_embedding(text: str, model="text-embedding-3-small"):
   if not openai.api_key:
       print("WARNING: OPENAI_API_KEY not found. Skipping embedding generation.")
       return None
   text = text.replace("\n", " ")
   try:
       response = openai.embeddings.create(input=[text], model=model)
       return response.data[0].embedding
   except Exception as e:
       print(f"ERROR: OpenAI API call failed: {e}. Skipping embedding generation.")
       return None

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        
        user = db.query(models.UserDB).filter(models.UserDB.email == email).first()
        if user is None:
            raise credentials_exception
            
    except JWTError:
        raise credentials_exception
    return user

async def get_current_teacher(current_user: models.UserDB = Depends(get_current_user)):
    if current_user.role != 'teacher':
        raise HTTPException(status_code=403, detail="Operation not permitted for this role")
    return current_user
EOL
# --- app/routers/auth.py ---
cat > app/routers/auth.py << 'EOL'
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from .. import database, schemas, models, security

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.UserDB).filter(models.UserDB.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = security.get_password_hash(user.password)
    new_user = models.UserDB(email=user.email, hashed_password=hashed_password, role=user.role)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": f"User {user.email} registered successfully as a {user.role}."}

@router.post("/login", response_model=schemas.Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = db.query(models.UserDB).filter(models.UserDB.email == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    access_token = security.create_access_token(data={"sub": user.email, "role": user.role})
    return {"access_token": access_token, "token_type": "bearer", "role": user.role}
EOL
# --- app/routers/projects.py ---
cat > app/routers/projects.py << 'EOL'
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import database, schemas, models, security

router = APIRouter(
    prefix="/projects",
    tags=["Projects"]
)

@router.post("/check-originality", response_model=schemas.OriginalityCheckResponse)
def check_project_originality(request: schemas.OriginalityCheckRequest, db: Session = Depends(database.get_db), current_user: models.UserDB = Depends(security.get_current_user)):
    combined_text = f"{request.title} {request.synopsis or ''}"
    new_embedding = security.get_embedding(combined_text)
    
    if new_embedding is None:
        raise HTTPException(status_code=400, detail="Cannot check originality without embedding generation.")

    SIMILARITY_THRESHOLD = 0.8
    similar_projects_db = db.query(models.ProjectDB, models.ProjectDB.embedding.l2_distance(new_embedding).label('distance')).filter(models.ProjectDB.embedding != None, models.ProjectDB.status == 'approved').order_by('distance').limit(3).all()

    similar_projects_response = []
    is_original = True
    message = "This project idea seems original!"

    if similar_projects_db:
        for project, distance in similar_projects_db:
            similarity_score = 1 - (distance / 2)
            similar_projects_response.append(schemas.SimilarProject(id=project.id, title=project.title, similarity_score=similarity_score))
        
        if similar_projects_response and similar_projects_response[0].similarity_score > SIMILARITY_THRESHOLD:
            is_original = False
            message = "This project is conceptually very similar to existing projects."

    return schemas.OriginalityCheckResponse(is_original=is_original, message=message, similar_projects=similar_projects_response)

@router.get("/", response_model=List[schemas.Project])
def read_all_projects(db: Session = Depends(database.get_db), current_user: models.UserDB = Depends(security.get_current_user)):
    return db.query(models.ProjectDB).filter(models.ProjectDB.status == 'approved').all()

@router.get("/my-projects", response_model=List[schemas.Project])
def read_my_projects(db: Session = Depends(database.get_db), current_user: models.UserDB = Depends(security.get_current_user)):
    return db.query(models.ProjectDB).filter(models.ProjectDB.owner_id == current_user.id).all()

@router.get("/mentored", response_model=List[schemas.Project])
def read_mentored_projects(db: Session = Depends(database.get_db), current_user: models.UserDB = Depends(security.get_current_teacher)):
    return [p for p in current_user.mentored_projects if p.status == 'approved']

@router.get("/pending", response_model=List[schemas.Project])
def read_pending_projects(db: Session = Depends(database.get_db), current_user: models.UserDB = Depends(security.get_current_teacher)):
    return db.query(models.ProjectDB).filter(models.ProjectDB.status == 'pending').all()

@router.put("/{project_id}/approve", response_model=schemas.Project)
def approve_project(project_id: int, db: Session = Depends(database.get_db), current_user: models.UserDB = Depends(security.get_current_teacher)):
    db_project = db.query(models.ProjectDB).filter(models.ProjectDB.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    db_project.status = 'approved'
    db.commit()
    db.refresh(db_project)
    return db_project

@router.put("/{project_id}/reject", response_model=schemas.Project)
def reject_project(project_id: int, db: Session = Depends(database.get_db), current_user: models.UserDB = Depends(security.get_current_teacher)):
    db_project = db.query(models.ProjectDB).filter(models.ProjectDB.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    db_project.status = 'rejected'
    db.commit()
    db.refresh(db_project)
    return db_project

@router.post("/", response_model=schemas.Project, status_code=201)
def create_project(project: schemas.ProjectCreate, db: Session = Depends(database.get_db), current_user: models.UserDB = Depends(security.get_current_user)):
    if current_user.role == 'student' and not project.mentor_email:
        raise HTTPException(status_code=422, detail="Mentor's email is required.")

    mentor = None
    if project.mentor_email:
        mentor = db.query(models.UserDB).filter(models.UserDB.email == project.mentor_email).first()
        if not mentor or mentor.role != 'teacher':
            raise HTTPException(status_code=404, detail=f"Mentor with email '{project.mentor_email}' not found.")

    embedding = security.get_embedding(f"{project.title} {project.synopsis or ''}")
    
    db_project = models.ProjectDB(
        title=project.title, 
        synopsis=project.synopsis, 
        owner_id=current_user.id,
        embedding=embedding,
        status='approved' if current_user.role == 'teacher' else 'pending'
    )
    
    if mentor:
        db_project.mentors.append(mentor)
    
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@router.put("/{project_id}", response_model=schemas.Project)
def update_project(project_id: int, project: schemas.ProjectUpdate, db: Session = Depends(database.get_db), current_user: models.UserDB = Depends(security.get_current_user)):
    db_project = db.query(models.ProjectDB).filter(models.ProjectDB.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    is_owner = db_project.owner_id == current_user.id
    is_teacher = current_user.role == 'teacher'

    if not (is_teacher or (is_owner and db_project.status == 'pending')):
        raise HTTPException(status_code=403, detail="Not authorized to update this project")
    
    update_data = project.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_project, key, value)
    
    if 'title' in update_data or 'synopsis' in update_data:
        db_project.embedding = security.get_embedding(f"{db_project.title} {db_project.synopsis or ''}")
        
    db.commit()
    db.refresh(db_project)
    return db_project

@router.delete("/{project_id}", status_code=204)
def delete_project(project_id: int, db: Session = Depends(database.get_db), current_user: models.UserDB = Depends(security.get_current_user)):
    db_project = db.query(models.ProjectDB).filter(models.ProjectDB.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    is_owner = db_project.owner_id == current_user.id
    is_teacher = current_user.role == 'teacher'

    if not (is_teacher or (is_owner and db_project.status == 'pending')):
        raise HTTPException(status_code=403, detail="Not authorized to delete this project")
        
    db.delete(db_project)
    db.commit()
    return
EOL

# --- NEW: app/routers/weather.py ---
cat > app/routers/weather.py << 'EOL'
from fastapi import APIRouter, HTTPException
import httpx
import os

router = APIRouter(
    prefix="/weather",
    tags=["Weather"]
)

@router.get("/")
async def get_weather():
    api_key = os.getenv("OPENWEATHER_API_KEY")
    if not api_key:
        print("ERROR: OPENWEATHER_API_KEY is not set in the .env file.")
        raise HTTPException(status_code=500, detail="Weather service is not configured.")

    lat = 12.9716  # Bangalore latitude
    lon = 77.5946  # Bangalore longitude
    url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={api_key}&units=metric"

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url)
            response.raise_for_status() # Raises an exception for 4xx/5xx errors
            data = response.json()
            
            # Return a simplified weather object
            return {
                "temp": round(data["main"]["temp"]),
                "description": data["weather"][0]["description"],
                "icon": data["weather"][0]["icon"],
                "city": data["name"],
            }
        except httpx.HTTPStatusError as e:
            # This will catch errors from OpenWeatherMap (e.g., invalid key)
            print(f"ERROR: Weather API request failed with status {e.response.status_code}")
            raise HTTPException(status_code=e.response.status_code, detail="Failed to fetch weather data from provider.")
        except Exception as e:
            print(f"ERROR: An unexpected error occurred while fetching weather: {e}")
            raise HTTPException(status_code=500, detail="An internal error occurred while fetching weather.")
EOL

# --- app/main.py (Updated to include weather router) ---
cat > app/main.py << 'EOL'
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from .database import engine, SessionLocal
from . import models
from .routers import projects, auth, weather # Import new router

models.Base.metadata.create_all(bind=engine)

with SessionLocal() as session:
    session.execute(text('CREATE EXTENSION IF NOT EXISTS vector'))
    session.commit()

app = FastAPI(
    title="Project API with Custom Auth",
    description="An API with authentication, project management, and weather.",
    version="7.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(weather.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Modular Project API!"}
EOL

echo "✅ Backend refactor for weather endpoint is complete!"
echo "IMPORTANT: Add 'httpx' to your requirements.txt and run 'pip install -r requirements.txt'"
echo "IMPORTANT: Add your OPENWEATHER_API_KEY to your .env file in the backend directory."
echo "To run your server, use: uvicorn app.main:app --reload"

