from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app import crud
from app.database import get_db

router = APIRouter()

@router.get("/devices-by-type")
def devices_by_type_report(db: Session = Depends(get_db)):
    return crud.get_devices_by_type_report(db)

@router.get("/device-status")
def device_status_report(db: Session = Depends(get_db)):
    return crud.get_device_status_report(db)

@router.get("/user-assignments")
def user_assignments_report(limit: int = 10, db: Session = Depends(get_db)):
    return crud.get_user_assignments_report(db, limit=limit)

@router.get("/expiring-warranties")
def expiring_warranties_report(days: int = 90, db: Session = Depends(get_db)):
    return crud.get_expiring_warranties_report(db, days=days)