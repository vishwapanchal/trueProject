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
