from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import crud
import schemas
from app.database import get_db

router = APIRouter()

@router.post("/", response_model=schemas.DeviceAssignment)
def create_assignment(assignment: schemas.DeviceAssignmentCreate, db: Session = Depends(get_db)):
    # Check if device exists
    db_device = crud.get_device(db, device_id=assignment.device_id)
    if db_device is None:
        raise HTTPException(status_code=404, detail="Device not found")
    
    # Check if device is already checked out
    if db_device.is_checked_out:
        raise HTTPException(status_code=400, detail="Device is already checked out")
        
    # Check if device is retired
    if db_device.is_retired:
        raise HTTPException(status_code=400, detail="Cannot assign a retired device")
    
    # Check if user exists
    db_user = crud.get_user(db, user_id=assignment.user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Check if user is active
    if not db_user.is_active:
        raise HTTPException(status_code=400, detail="Cannot assign to inactive user")
    
    # Create assignment and update device status
    return crud.create_assignment(db=db, assignment=assignment)

@router.get("/", response_model=List[schemas.DeviceAssignment])
def read_assignments(
    skip: int = 0, 
    limit: int = 100, 
    device_id: Optional[int] = None,
    user_id: Optional[int] = None,
    active_only: bool = False,
    db: Session = Depends(get_db)
):
    assignments = crud.get_assignments(
        db, 
        skip=skip, 
        limit=limit, 
        device_id=device_id,
        user_id=user_id,
        active_only=active_only
    )
    return assignments

@router.get("/{assignment_id}", response_model=schemas.DeviceAssignmentDetail)
def read_assignment(assignment_id: int, db: Session = Depends(get_db)):
    db_assignment = crud.get_assignment(db, assignment_id=assignment_id)
    if db_assignment is None:
        raise HTTPException(status_code=404, detail="Assignment not found")
    return db_assignment

@router.put("/{assignment_id}/return", response_model=schemas.DeviceAssignment)
def return_device(
    assignment_id: int, 
    return_info: schemas.DeviceReturn, 
    db: Session = Depends(get_db)
):
    db_assignment = crud.get_assignment(db, assignment_id=assignment_id)
    if db_assignment is None:
        raise HTTPException(status_code=404, detail="Assignment not found")
        
    if db_assignment.actual_return_date is not None:
        raise HTTPException(status_code=400, detail="Device has already been returned")
        
    return crud.return_device(db=db, assignment_id=assignment_id, return_info=return_info)