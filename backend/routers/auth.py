from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import Optional
from jose import JWTError, jwt
from pydantic import BaseModel
from fastapi import Request
import uuid
import random
import string
import base64
from captcha.image import ImageCaptcha
import time
from backend.database import SessionLocal
from backend import models

from .. import database, schemas, models, auth, crud

# In-memory store for CAPTCHAs (ID -> {text, expires_at})
# In a production distributed environment, use Redis.
CAPTCHA_STORE = {}


router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)

class RefreshRequest(BaseModel):
    refresh_token: str

@router.post("/register", response_model=schemas.UserOut)
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    """
    Self-registration is restricted to Farmer role only.
    Privileged roles (Village, Block, District Officers) must be created
    by a Director via the /admin/users endpoint.
    """
    if user.role != models.UserRole.FARMER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Self-registration is only allowed for the Farmer role. "
                   "Contact a Director to create accounts with elevated roles."
        )

    # Password Complexity Check
    if len(user.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long")

    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    return crud.create_user(db=db, user=user)

@router.get("/captcha")
def generate_captcha():
    print("CAPTCHA: Start generation")
    # Clean up expired captchas
    current_time = time.time()
    expired_keys = [k for k, v in CAPTCHA_STORE.items() if v['expires_at'] < current_time]
    for k in expired_keys:
        del CAPTCHA_STORE[k]
    print("CAPTCHA: Cleaned expired")

    # Generate random 5-character string (excluding confusing characters like O, 0, I, 1, l)
    chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    captcha_text = ''.join(random.choice(chars) for _ in range(5))
    captcha_id = str(uuid.uuid4())
    print(f"CAPTCHA: Generated text {captcha_text}")
    
    # Store with a 5-minute expiration
    CAPTCHA_STORE[captcha_id] = {
        'text': captcha_text,
        'expires_at': current_time + 300
    }
    print("CAPTCHA: Stored locally")
    
    try:
        # Generate image
        print("CAPTCHA: Init ImageCaptcha")
        image = ImageCaptcha(width=160, height=60)
        print("CAPTCHA: Calling generate()")
        data = image.generate(captcha_text)
        print("CAPTCHA: Encoding...")
        base64_img = base64.b64encode(data.getvalue()).decode('utf-8')
        image_url = f"data:image/png;base64,{base64_img}"
        print("CAPTCHA: Success!")
        return {"captcha_id": captcha_id, "image_data": image_url}
    except Exception as e:
        print(f"CAPTCHA Error: {e}")
        raise e

@router.post("/login", response_model=schemas.Token)
def login_for_access_token(req: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    # 1. Validate CAPTCHA first
    captcha_id = req.headers.get("x-captcha-id")
    captcha_value = req.headers.get("x-captcha-value")

    if not captcha_id or not captcha_value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CAPTCHA is required"
        )
        
    stored_captcha = CAPTCHA_STORE.get(captcha_id)
    if not stored_captcha:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CAPTCHA expired or invalid ID. Please refresh the image."
        )
        
    if stored_captcha['text'].upper() != captcha_value.upper():
        # Clean up the failed attempt's token to prevent brute forcing the same image
        del CAPTCHA_STORE[captcha_id]
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect CAPTCHA entered. Please try again."
        )
        
    # Successfully solved, remove it from memory
    del CAPTCHA_STORE[captcha_id]

    # 2. Proceed with DB username/password check
    user = crud.get_user_by_username(db, username=form_data.username)
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username, "role": str(user.role.value), "id": user.id},
        expires_delta=access_token_expires
    )
    refresh_token = auth.create_refresh_token(
        data={"sub": user.username, "role": str(user.role.value)}
    )
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/refresh", response_model=schemas.Token)
def refresh_access_token(body: RefreshRequest, db: Session = Depends(database.get_db)):
    """
    Exchange a valid refresh token for a new access token.
    Allows users to stay logged in without re-entering credentials.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired refresh token. Please log in again.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(body.refresh_token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        username: str = payload.get("sub")
        token_type: str = payload.get("type")
        if username is None or token_type != "refresh":
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = crud.get_user_by_username(db, username=username)
    if user is None:
        raise credentials_exception

    # Issue a new access token (and a new refresh token to extend the session)
    access_token = auth.create_access_token(
        data={"sub": user.username, "role": str(user.role.value), "id": user.id}
    )
    new_refresh_token = auth.create_refresh_token(
        data={"sub": user.username, "role": str(user.role.value), "id": user.id}
    )
    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    }

@router.get("/managers", response_model=list[schemas.UserOut])
def read_managers(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    return crud.get_managers(db)
