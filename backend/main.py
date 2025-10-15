import os
from datetime import datetime, timedelta, timezone
from typing import List, Optional

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from sqlalchemy import Column, Integer, TEXT, String, create_engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker

# --- 1. SETUP AND CONFIGURATION ---

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise Exception("DATABASE_URL not found in .env file.")

# --- Security Configuration ---
SECRET_KEY = "your_super_secret_random_string_for_jwt" # Change this in production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# Password hashing setup
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

# OAuth2 scheme for token handling
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# --- FastAPI App Initialization ---
app = FastAPI(
    title="Project API with Custom Auth",
    description="An API with a from-scratch authentication system.",
    version="3.0.0",
)

# --- CORS Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Database Setup ---
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# --- 2. DATABASE MODELS ---

class ProjectDB(Base):
    __tablename__ = 'existing_projects'
    id = Column(Integer, primary_key=True, index=True)
    title = Column(TEXT, nullable=False)
    synopsis = Column(TEXT)

class UserDB(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default='teacher')


# --- 3. PYDANTIC MODELS (Data Validation) ---

# For Projects
class ProjectBase(BaseModel):
    title: str
    synopsis: Optional[str] = None

class ProjectCreate(ProjectBase): pass
class ProjectUpdate(ProjectBase): pass

class Project(ProjectBase):
    id: int
    class Config:
        from_attributes = True

# For Users & Auth
class UserCreate(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None


# --- 4. AUTHENTICATION HELPER FUNCTIONS ---

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# --- 5. DEPENDENCIES ---

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_current_teacher(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        role: str = payload.get("role")
        if email is None or role != 'teacher':
            raise credentials_exception
        
        user = db.query(UserDB).filter(UserDB.email == email).first()
        if user is None:
            raise credentials_exception
            
    except JWTError:
        raise credentials_exception
    return user


# --- 6. API ENDPOINTS ---

# --- Authentication Routes ---
@app.post("/register", status_code=status.HTTP_201_CREATED, tags=["Authentication"])
def register_teacher(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(UserDB).filter(UserDB.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = UserDB(email=user.email, hashed_password=hashed_password, role='teacher')
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": f"User {user.email} registered successfully as a teacher."}


@app.post("/login", response_model=Token, tags=["Authentication"])
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(UserDB).filter(UserDB.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    access_token = create_access_token(data={"sub": user.email, "role": user.role})
    return {"access_token": access_token, "token_type": "bearer"}


# --- Public Project Routes ---
@app.get("/projects", response_model=List[Project], tags=["Projects"])
def read_all_projects(db: Session = Depends(get_db)):
    return db.query(ProjectDB).all()


# --- Protected Project Routes (Teacher Only) ---
@app.post("/projects", response_model=Project, status_code=201, tags=["Projects (Teacher Only)"])
def create_project(project: ProjectCreate, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_teacher)):
    db_project = ProjectDB(**project.model_dump())
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

# (Update and Delete endpoints remain the same but are now protected by `Depends(get_current_teacher)`)
@app.put("/projects/{project_id}", response_model=Project, tags=["Projects (Teacher Only)"])
def update_project(project_id: int, project: ProjectUpdate, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_teacher)):
    db_project = db.query(ProjectDB).filter(ProjectDB.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    for key, value in project.model_dump().items():
        setattr(db_project, key, value)
        
    db.commit()
    db.refresh(db_project)
    return db_project

@app.delete("/projects/{project_id}", status_code=204, tags=["Projects (Teacher Only)"])
def delete_project(project_id: int, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_teacher)):
    db_project = db.query(ProjectDB).filter(ProjectDB.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    db.delete(db_project)
    db.commit()
    return

