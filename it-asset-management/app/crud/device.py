from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
from app import models
from app import schemas

# Device CRUD operations
def get_device(db: Session, device_id: int):
    return db.query(models.Device).filter(models.Device.device_id == device_id).first()

def get_device_by_serial(db: Session, serial_number: str):
    return db.query(models.Device).filter(models.Device.serial_number == serial_number).first()

def get_devices(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    device_type_id: Optional[int] = None,
    is_checked_out: Optional[bool] = None,
    is_retired: Optional[bool] = None,
    search: Optional[str] = None
):
    query = db.query(models.Device)
    
    # Apply filters
    if device_type_id is not None:
        query = query.filter(models.Device.device_type_id == device_type_id)
    
    if is_checked_out is not None:
        query = query.filter(models.Device.is_checked_out == is_checked_out)
    
    if is_retired is not None:
        query = query.filter(models.Device.is_retired == is_retired)
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                models.Device.serial_number.ilike(search_term),
                models.Device.device_name.ilike(search_term),
                models.Device.model.ilike(search_term)
            )
        )
    
    return query.order_by(models.Device.device_id).offset(skip).limit(limit).all()

def create_device(db: Session, device: schemas.DeviceCreate):
    db_device = models.Device(
        device_type_id=device.device_type_id,
        serial_number=device.serial_number,
        device_name=device.device_name,
        atera_link=device.atera_link,
        purchase_id=device.purchase_id,
        purchase_date=device.purchase_date,
        refresh_cycle=device.refresh_cycle,
        headset_type=device.headset_type,
        model=device.model,
        warranty_expiration=device.warranty_expiration,
        notes=device.notes,
        is_checked_out=device.is_checked_out,
        is_retired=device.is_retired
    )
    db.add(db_device)
    db.commit()
    db.refresh(db_device)
    return db_device

def update_device(db: Session, device_id: int, device: schemas.DeviceUpdate):
    db_device = get_device(db, device_id)
    
    if device.device_type_id is not None:
        db_device.device_type_id = device.device_type_id
    if device.serial_number is not None:
        db_device.serial_number = device.serial_number
    if device.device_name is not None:
        db_device.device_name = device.device_name
    if device.atera_link is not None:
        db_device.atera_link = device.atera_link
    if device.purchase_id is not None:
        db_device.purchase_id = device.purchase_id
    if device.purchase_date is not None:
        db_device.purchase_date = device.purchase_date
    if device.refresh_cycle is not None:
        db_device.refresh_cycle = device.refresh_cycle
    if device.headset_type is not None:
        db_device.headset_type = device.headset_type
    if device.model is not None:
        db_device.model = device.model
    if device.warranty_expiration is not None:
        db_device.warranty_expiration = device.warranty_expiration
    if device.notes is not None:
        db_device.notes = device.notes
    if device.is_retired is not None:
        db_device.is_retired = device.is_retired
    
    db.commit()
    db.refresh(db_device)
    return db_device

def retire_device(db: Session, device_id: int):
    db_device = get_device(db, device_id)
    db_device.is_retired = True
    db.commit()
    db.refresh(db_device)
    return db_device