# models.py
from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Date, DateTime, Text, Numeric, func
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    last_name = Column(String(100), nullable=False)
    first_name = Column(String(100), nullable=False)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_admin = Column(Boolean, default=False, nullable=False)
    created_date = Column(DateTime, default=func.now(), nullable=False)
    last_modified_date = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    assignments = relationship("DeviceAssignment", back_populates="user", foreign_keys="[DeviceAssignment.user_id]")
    created_assignments = relationship("DeviceAssignment", back_populates="created_by_user", 
                                    foreign_keys="[DeviceAssignment.created_by]")

class DeviceType(Base):
    __tablename__ = "device_types"
    
    device_type_id = Column(Integer, primary_key=True, index=True)
    type_name = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(String(255), nullable=True)
    refresh_cycle_months = Column(Integer, nullable=True)
    created_date = Column(DateTime, default=func.now(), nullable=False)
    last_modified_date = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    devices = relationship("Device", back_populates="device_type")

class Purchase(Base):
    __tablename__ = "purchases"
    
    purchase_id = Column(Integer, primary_key=True, index=True)
    purchase_order = Column(String(50), unique=True, nullable=True, index=True)
    purchase_date = Column(Date, nullable=True)
    vendor = Column(String(100), nullable=True)
    total_amount = Column(Numeric(10, 2), nullable=True)
    notes = Column(Text, nullable=True)
    created_date = Column(DateTime, default=func.now(), nullable=False)
    last_modified_date = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    devices = relationship("Device", back_populates="purchase")

class Device(Base):
    __tablename__ = "devices"
    
    device_id = Column(Integer, primary_key=True, index=True)
    device_type_id = Column(Integer, ForeignKey("device_types.device_type_id"), nullable=False)
    serial_number = Column(String(50), unique=True, nullable=False, index=True)
    device_name = Column(String(100), nullable=True)
    atera_link = Column(String(255), nullable=True)
    is_checked_out = Column(Boolean, default=False, nullable=False)
    purchase_id = Column(Integer, ForeignKey("purchases.purchase_id"), nullable=True)
    purchase_date = Column(Date, nullable=True)
    refresh_cycle = Column(String(50), nullable=True)
    headset_type = Column(String(20), nullable=True)
    is_retired = Column(Boolean, default=False, nullable=False)
    model = Column(String(100), nullable=True)
    warranty_expiration = Column(Date, nullable=True)
    notes = Column(Text, nullable=True)
    created_date = Column(DateTime, default=func.now(), nullable=False)
    last_modified_date = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    device_type = relationship("DeviceType", back_populates="devices")
    purchase = relationship("Purchase", back_populates="devices")
    assignments = relationship("DeviceAssignment", back_populates="device")

class DeviceAssignment(Base):
    __tablename__ = "device_assignments"
    
    assignment_id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer, ForeignKey("devices.device_id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    checkout_date = Column(Date, nullable=False, default=func.current_date())
    expected_return_date = Column(Date, nullable=True)
    actual_return_date = Column(Date, nullable=True)
    checkout_condition = Column(String(255), nullable=True)
    return_condition = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    created_by = Column(Integer, ForeignKey("users.user_id"), nullable=True)
    created_date = Column(DateTime, default=func.now(), nullable=False)
    last_modified_date = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    device = relationship("Device", back_populates="assignments")
    user = relationship("User", back_populates="assignments", foreign_keys=[user_id])
    created_by_user = relationship("User", back_populates="created_assignments", foreign_keys=[created_by])