from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
from passlib.context import CryptContext
from app import models
from app import schemas

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Helper functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# User CRUD operations
def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.user_id == user_id).first()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_users(
    db: Session, 
    skip: int = 0, 
    limit: int = 100, 
    is_active: Optional[bool] = None,
    search: Optional[str] = None
):
    query = db.query(models.User)
    
    # Apply filters
    if is_active is not None:
        query = query.filter(models.User.is_active == is_active)
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                models.User.first_name.ilike(search_term),
                models.User.last_name.ilike(search_term),
                models.User.username.ilike(search_term),
                models.User.email.ilike(search_term)
            )
        )
    
    return query.order_by(models.User.last_name, models.User.first_name).offset(skip).limit(limit).all()

def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(
        first_name=user.first_name,
        last_name=user.last_name,
        username=user.username,
        email=user.email,
        is_active=user.is_active,
        is_admin=user.is_admin,
        start_date=user.start_date,
        end_date=user.end_date
    )
    
    if user.password:
        db_user.password_hash = hash_password(user.password)
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, user: schemas.UserUpdate):
    db_user = get_user(db, user_id)
    
    if user.first_name is not None:
        db_user.first_name = user.first_name
    if user.last_name is not None:
        db_user.last_name = user.last_name
    if user.username is not None:
        db_user.username = user.username
    if user.email is not None:
        db_user.email = user.email
    if user.is_active is not None:
        db_user.is_active = user.is_active
    if user.is_admin is not None:
        db_user.is_admin = user.is_admin
    if user.start_date is not None:
        db_user.start_date = user.start_date
    if user.end_date is not None:
        db_user.end_date = user.end_date
    if user.password:
        db_user.password_hash = hash_password(user.password)
    
    db.commit()
    db.refresh(db_user)
    return db_user