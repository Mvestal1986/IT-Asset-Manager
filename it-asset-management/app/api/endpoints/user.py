from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import crud
import schemas
from app.database import get_db

router = APIRouter()

@router.post("/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user_by_username = crud.get_user_by_username(db, username=user.username)
    if db_user_by_username:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    db_user_by_email = crud.get_user_by_email(db, email=user.email)
    if db_user_by_email:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    return crud.create_user(db=db, user=user)

@router.get("/", response_model=List[schemas.User])
def read_users(
    skip: int = 0, 
    limit: int = 100, 
    is_active: Optional[bool] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    users = crud.get_users(db, skip=skip, limit=limit, is_active=is_active, search=search)
    return users

@router.get("/{user_id}", response_model=schemas.UserDetail)
def read_user(user_id: int, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.put("/{user_id}", response_model=schemas.User)
def update_user(user_id: int, user: schemas.UserUpdate, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if updated username exists for another user
    if user.username is not None:
        db_user_by_username = crud.get_user_by_username(db, username=user.username)
        if db_user_by_username and db_user_by_username.user_id != user_id:
            raise HTTPException(status_code=400, detail="Username already registered")
    
    # Check if updated email exists for another user
    if user.email is not None:
        db_user_by_email = crud.get_user_by_email(db, email=user.email)
        if db_user_by_email and db_user_by_email.user_id != user_id:
            raise HTTPException(status_code=400, detail="Email already registered")
            
    return crud.update_user(db=db, user_id=user_id, user=user)