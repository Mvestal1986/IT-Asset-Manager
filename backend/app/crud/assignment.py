from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional
from app import models
from app import schemas
from .device import get_device

# Device Assignment CRUD operations
def get_assignment(db: Session, assignment_id: int):
    return db.query(models.DeviceAssignment).filter(models.DeviceAssignment.assignment_id == assignment_id).first()

def get_assignments(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    device_id: Optional[int] = None,
    user_id: Optional[int] = None,
    active_only: bool = False
):
    query = db.query(models.DeviceAssignment)
    
    # Apply filters
    if device_id is not None:
        query = query.filter(models.DeviceAssignment.device_id == device_id)
    
    if user_id is not None:
        query = query.filter(models.DeviceAssignment.user_id == user_id)
    
    if active_only:
        query = query.filter(models.DeviceAssignment.actual_return_date == None)
    
    return query.order_by(desc(models.DeviceAssignment.checkout_date)).offset(skip).limit(limit).all()

def create_assignment(db: Session, assignment: schemas.DeviceAssignmentCreate):
    # Create the assignment
    db_assignment = models.DeviceAssignment(
        device_id=assignment.device_id,
        user_id=assignment.user_id,
        checkout_date=assignment.checkout_date,
        expected_return_date=assignment.expected_return_date,
        checkout_condition=assignment.checkout_condition,
        notes=assignment.notes,
        created_by=assignment.created_by
    )
    db.add(db_assignment)
    
    # Update device status
    db_device = get_device(db, assignment.device_id)
    db_device.is_checked_out = True
    
    db.commit()
    db.refresh(db_assignment)
    return db_assignment

def return_device(db: Session, assignment_id: int, return_info: schemas.DeviceReturn):
    # Get assignment
    db_assignment = get_assignment(db, assignment_id)
    
    # Update assignment
    db_assignment.actual_return_date = return_info.actual_return_date
    db_assignment.return_condition = return_info.return_condition
    
    # Update notes if provided
    if return_info.notes:
        if db_assignment.notes:
            db_assignment.notes = f"{db_assignment.notes}\n\nReturn Notes: {return_info.notes}"
        else:
            db_assignment.notes = f"Return Notes: {return_info.notes}"
    
    # Update device status
    db_device = get_device(db, db_assignment.device_id)
    db_device.is_checked_out = False
    
    db.commit()
    db.refresh(db_assignment)
    return db_assignment