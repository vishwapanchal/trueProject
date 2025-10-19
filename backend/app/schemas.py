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
