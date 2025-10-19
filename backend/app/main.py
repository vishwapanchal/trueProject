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
