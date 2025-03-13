from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import date, timedelta
import models

# Reports
def get_devices_by_type_report(db: Session):
    result = db.query(
        models.DeviceType.type_name,
        func.count(models.Device.device_id).label('count')
    ).join(
        models.Device
    ).filter(
        models.Device.is_retired == False
    ).group_by(
        models.DeviceType.type_name
    ).all()
    
    return [{"type": item[0], "count": item[1]} for item in result]

def get_device_status_report(db: Session):
    # Get counts by status
    available_count = db.query(func.count(models.Device.device_id)).filter(
        models.Device.is_checked_out == False,
        models.Device.is_retired == False
    ).scalar()
    
    checked_out_count = db.query(func.count(models.Device.device_id)).filter(
        models.Device.is_checked_out == True,
        models.Device.is_retired == False
    ).scalar()
    
    retired_count = db.query(func.count(models.Device.device_id)).filter(
        models.Device.is_retired == True
    ).scalar()
    
    return [
        {"status": "Available", "count": available_count},
        {"status": "Checked Out", "count": checked_out_count},
        {"status": "Retired", "count": retired_count}
    ]

def get_user_assignments_report(db: Session, limit: int = 10):
    result = db.query(
        models.User.user_id,
        models.User.first_name,
        models.User.last_name,
        func.count(models.DeviceAssignment.assignment_id).label('count')
    ).join(
        models.DeviceAssignment
    ).filter(
        models.DeviceAssignment.actual_return_date == None
    ).group_by(
        models.User.user_id,
        models.User.first_name,
        models.User.last_name
    ).order_by(
        desc('count')
    ).limit(limit).all()
    
    return [
        {
            "user_id": item[0],
            "name": f"{item[1]} {item[2]}",
            "count": item[3]
        } for item in result
    ]

def get_expiring_warranties_report(db: Session, days: int = 90):
    today = date.today()
    expiry_date = today + timedelta(days=days)
    
    result = db.query(
        models.Device
    ).filter(
        models.Device.warranty_expiration.between(today, expiry_date),
        models.Device.is_retired == False
    ).order_by(
        models.Device.warranty_expiration
    ).all()
    
    return [
        {
            "device_id": device.device_id,
            "serial_number": device.serial_number,
            "device_name": device.device_name,
            "model": device.model,
            "warranty_expiration": device.warranty_expiration
        } for device in result
    ]