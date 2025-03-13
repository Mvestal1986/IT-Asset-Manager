from sqlalchemy.orm import Session
import models
import schemas

# Device Type CRUD operations
def get_device_type(db: Session, device_type_id: int):
    return db.query(models.DeviceType).filter(models.DeviceType.device_type_id == device_type_id).first()

def get_device_type_by_name(db: Session, name: str):
    return db.query(models.DeviceType).filter(models.DeviceType.type_name == name).first()

def get_device_types(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.DeviceType).offset(skip).limit(limit).all()

def create_device_type(db: Session, device_type: schemas.DeviceTypeCreate):
    db_device_type = models.DeviceType(
        type_name=device_type.type_name,
        description=device_type.description,
        refresh_cycle_months=device_type.refresh_cycle_months
    )
    db.add(db_device_type)
    db.commit()
    db.refresh(db_device_type)
    return db_device_type

def update_device_type(db: Session, device_type_id: int, device_type: schemas.DeviceTypeUpdate):
    db_device_type = get_device_type(db, device_type_id)
    if device_type.type_name is not None:
        db_device_type.type_name = device_type.type_name
    if device_type.description is not None:
        db_device_type.description = device_type.description
    if device_type.refresh_cycle_months is not None:
        db_device_type.refresh_cycle_months = device_type.refresh_cycle_months
    
    db.commit()
    db.refresh(db_device_type)
    return db_device_type