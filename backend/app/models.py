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
