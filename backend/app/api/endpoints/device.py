from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app import crud
from app import schemas
from app.database import get_db

router = APIRouter()

@router.post("/", response_model=schemas.Device)
def create_device(device: schemas.DeviceCreate, db: Session = Depends(get_db)):
    # Check if serial number exists
    db_device = crud.get_device_by_serial(db, serial_number=device.serial_number)
    if db_device:
        raise HTTPException(status_code=400, detail="Serial number already registered")
    
    # Check if device type exists
    if not crud.get_device_type(db, device_type_id=device.device_type_id):
        raise HTTPException(status_code=404, detail="Device type not found")
        
    # Check if purchase exists if provided
    if device.purchase_id and not crud.get_purchase(db, purchase_id=device.purchase_id):
        raise HTTPException(status_code=404, detail="Purchase not found")
        
    return crud.create_device(db=db, device=device)

@router.get("/", response_model=List[schemas.Device])
def read_devices(
    skip: int = 0, 
    limit: int = 100, 
    device_type_id: Optional[int] = None,
    is_checked_out: Optional[bool] = None,
    is_retired: Optional[bool] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    devices = crud.get_devices(
        db, 
        skip=skip, 
        limit=limit, 
        device_type_id=device_type_id,
        is_checked_out=is_checked_out,
        is_retired=is_retired,
        search=search
    )
    return devices

@router.get("/{device_id}", response_model=schemas.DeviceDetail)
def read_device(device_id: int, db: Session = Depends(get_db)):
    db_device = crud.get_device(db, device_id=device_id)
    if db_device is None:
        raise HTTPException(status_code=404, detail="Device not found")
    return db_device

@router.put("/{device_id}", response_model=schemas.Device)
def update_device(device_id: int, device: schemas.DeviceUpdate, db: Session = Depends(get_db)):
    db_device = crud.get_device(db, device_id=device_id)
    if db_device is None:
        raise HTTPException(status_code=404, detail="Device not found")
    
    # Check if serial number exists for another device
    if device.serial_number is not None:
        db_device_by_serial = crud.get_device_by_serial(db, serial_number=device.serial_number)
        if db_device_by_serial and db_device_by_serial.device_id != device_id:
            raise HTTPException(status_code=400, detail="Serial number already registered")
    
    # Check if device type exists if provided
    if device.device_type_id is not None and not crud.get_device_type(db, device_type_id=device.device_type_id):
        raise HTTPException(status_code=404, detail="Device type not found")
        
    # Check if purchase exists if provided
    if device.purchase_id is not None and device.purchase_id > 0 and not crud.get_purchase(db, purchase_id=device.purchase_id):
        raise HTTPException(status_code=404, detail="Purchase not found")
        
    return crud.update_device(db=db, device_id=device_id, device=device)

@router.put("/{device_id}/retire", response_model=schemas.Device)
def retire_device(device_id: int, db: Session = Depends(get_db)):
    db_device = crud.get_device(db, device_id=device_id)
    if db_device is None:
        raise HTTPException(status_code=404, detail="Device not found")
    
    if db_device.is_checked_out:
        raise HTTPException(status_code=400, detail="Cannot retire a device that is checked out")
        
    return crud.retire_device(db=db, device_id=device_id)