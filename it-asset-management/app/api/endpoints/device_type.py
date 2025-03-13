from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import crud
import schemas
from app.database import get_db

router = APIRouter()

@router.post("/", response_model=schemas.DeviceType)
def create_device_type(device_type: schemas.DeviceTypeCreate, db: Session = Depends(get_db)):
    db_device_type = crud.get_device_type_by_name(db, name=device_type.type_name)
    if db_device_type:
        raise HTTPException(status_code=400, detail="Device type already registered")
    return crud.create_device_type(db=db, device_type=device_type)

@router.get("/", response_model=List[schemas.DeviceType])
def read_device_types(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    device_types = crud.get_device_types(db, skip=skip, limit=limit)
    return device_types

@router.get("/{device_type_id}", response_model=schemas.DeviceType)
def read_device_type(device_type_id: int, db: Session = Depends(get_db)):
    db_device_type = crud.get_device_type(db, device_type_id=device_type_id)
    if db_device_type is None:
        raise HTTPException(status_code=404, detail="Device type not found")
    return db_device_type

@router.put("/{device_type_id}", response_model=schemas.DeviceType)
def update_device_type(device_type_id: int, device_type: schemas.DeviceTypeUpdate, db: Session = Depends(get_db)):
    db_device_type = crud.get_device_type(db, device_type_id=device_type_id)
    if db_device_type is None:
        raise HTTPException(status_code=404, detail="Device type not found")
    
    # Check if name exists for another device type
    if device_type.type_name is not None:
        db_device_type_by_name = crud.get_device_type_by_name(db, name=device_type.type_name)
        if db_device_type_by_name and db_device_type_by_name.device_type_id != device_type_id:
            raise HTTPException(status_code=400, detail="Device type name already exists")
            
    return crud.update_device_type(db=db, device_type_id=device_type_id, device_type=device_type)