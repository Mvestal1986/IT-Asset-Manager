# schemas.py
from pydantic import BaseModel, EmailStr, validator, Field
from typing import List, Optional
from datetime import date, datetime
from decimal import Decimal

# Base schema classes for common fields
class DeviceTypeBase(BaseModel):
    type_name: str
    description: Optional[str] = None
    refresh_cycle_months: Optional[int] = None

class UserBase(BaseModel):
    first_name: str
    last_name: str
    username: str
    email: EmailStr
    is_active: bool = True
    is_admin: bool = False
    start_date: Optional[date] = None
    end_date: Optional[date] = None

class PurchaseBase(BaseModel):
    purchase_order: Optional[str] = None
    purchase_date: Optional[date] = None
    vendor: Optional[str] = None
    total_amount: Optional[Decimal] = None
    notes: Optional[str] = None

class DeviceBase(BaseModel):
    device_type_id: int
    serial_number: str
    device_name: Optional[str] = None
    atera_link: Optional[str] = None
    purchase_id: Optional[int] = None
    purchase_date: Optional[date] = None
    refresh_cycle: Optional[str] = None
    headset_type: Optional[str] = None
    model: Optional[str] = None
    warranty_expiration: Optional[date] = None
    notes: Optional[str] = None

class DeviceAssignmentBase(BaseModel):
    device_id: int
    user_id: int
    checkout_date: date = Field(default_factory=date.today)
    expected_return_date: Optional[date] = None
    checkout_condition: Optional[str] = None
    notes: Optional[str] = None
    created_by: Optional[int] = None

# Create schemas
class DeviceTypeCreate(DeviceTypeBase):
    pass

class UserCreate(UserBase):
    password: Optional[str] = None

class PurchaseCreate(PurchaseBase):
    pass

class DeviceCreate(DeviceBase):
    is_retired: bool = False
    is_checked_out: bool = False

class DeviceAssignmentCreate(DeviceAssignmentBase):
    pass

# Update schemas
class DeviceTypeUpdate(BaseModel):
    type_name: Optional[str] = None
    description: Optional[str] = None
    refresh_cycle_months: Optional[int] = None

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None
    is_admin: Optional[bool] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None

class PurchaseUpdate(BaseModel):
    purchase_order: Optional[str] = None
    purchase_date: Optional[date] = None
    vendor: Optional[str] = None
    total_amount: Optional[Decimal] = None
    notes: Optional[str] = None

class DeviceUpdate(BaseModel):
    device_type_id: Optional[int] = None
    serial_number: Optional[str] = None
    device_name: Optional[str] = None
    atera_link: Optional[str] = None
    purchase_id: Optional[int] = None
    purchase_date: Optional[date] = None
    refresh_cycle: Optional[str] = None
    headset_type: Optional[str] = None
    is_retired: Optional[bool] = None
    model: Optional[str] = None
    warranty_expiration: Optional[date] = None
    notes: Optional[str] = None

class DeviceReturn(BaseModel):
    actual_return_date: date = Field(default_factory=date.today)
    return_condition: Optional[str] = None
    notes: Optional[str] = None

# Response schemas with ID and timestamps
class DeviceType(DeviceTypeBase):
    device_type_id: int
    created_date: datetime
    last_modified_date: datetime
    
    class Config:
        orm_mode = True

class User(UserBase):
    user_id: int
    created_date: datetime
    last_modified_date: datetime
    
    class Config:
        orm_mode = True

class Purchase(PurchaseBase):
    purchase_id: int
    created_date: datetime
    last_modified_date: datetime
    
    class Config:
        orm_mode = True

class Device(DeviceBase):
    device_id: int
    is_checked_out: bool
    is_retired: bool
    created_date: datetime
    last_modified_date: datetime
    
    class Config:
        orm_mode = True

class DeviceAssignment(DeviceAssignmentBase):
    assignment_id: int
    actual_return_date: Optional[date] = None
    return_condition: Optional[str] = None
    created_date: datetime
    last_modified_date: datetime
    
    class Config:
        orm_mode = True

# Nested response schemas for detailed views
class UserBrief(BaseModel):
    user_id: int
    first_name: str
    last_name: str
    username: str
    email: EmailStr
    is_active: bool
    
    class Config:
        orm_mode = True

class DeviceTypeBrief(BaseModel):
    device_type_id: int
    type_name: str
    
    class Config:
        orm_mode = True

class PurchaseBrief(BaseModel):
    purchase_id: int
    purchase_order: Optional[str] = None
    purchase_date: Optional[date] = None
    vendor: Optional[str] = None
    
    class Config:
        orm_mode = True

class DeviceBrief(BaseModel):
    device_id: int
    serial_number: str
    device_name: Optional[str] = None
    model: Optional[str] = None
    is_checked_out: bool
    is_retired: bool
    
    class Config:
        orm_mode = True

class AssignmentBrief(BaseModel):
    assignment_id: int
    checkout_date: date
    expected_return_date: Optional[date] = None
    actual_return_date: Optional[date] = None
    
    class Config:
        orm_mode = True

# Detailed response schemas with relationships
class DeviceDetail(Device):
    device_type: DeviceTypeBrief
    purchase: Optional[PurchaseBrief] = None
    active_assignment: Optional[AssignmentBrief] = None
    
    class Config:
        orm_mode = True

class UserDetail(User):
    active_assignments: List[AssignmentBrief] = []
    
    class Config:
        orm_mode = True

class PurchaseDetail(Purchase):
    devices: List[DeviceBrief] = []
    
    class Config:
        orm_mode = True

class DeviceAssignmentDetail(DeviceAssignment):
    device: DeviceBrief
    user: UserBrief
    created_by_user: Optional[UserBrief] = None
    
    class Config:
        orm_mode = True