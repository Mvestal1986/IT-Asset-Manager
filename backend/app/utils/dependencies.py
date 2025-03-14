from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from typing import Optional

import crud
from app.core.config import get_settings
from app.database import get_db

settings = get_settings()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token", auto_error=False)

async def get_current_user(
    db: Session = Depends(get_db),
    token: Optional[str] = Depends(oauth2_scheme)
):
    """
    Get the current authenticated user based on the JWT token.
    
    Note: This is a placeholder for future authentication implementation.
    Currently, it does not enforce authentication but is included for future use.
    
    Args:
        db: Database session
        token: JWT token
        
    Returns:
        User model instance if authenticated
        
    Raises:
        HTTPException: If authentication fails
    """
    if token is None:
        # For now, we'll return None to indicate no user is authenticated
        # This allows the API to work without authentication
        return None
        
    # This section will be implemented when authentication is added
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = crud.get_user_by_username(db, username=username)
    if user is None:
        raise credentials_exception
        
    return user

async def get_admin_user(
    current_user = Depends(get_current_user)
):
    """
    Check if the current user has admin privileges.
    
    Note: This is a placeholder for future authentication implementation.
    
    Args:
        current_user: User model instance from get_current_user
        
    Returns:
        User model instance if admin
        
    Raises:
        HTTPException: If user is not an admin
    """
    if current_user is None or not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions",
        )
    return current_user