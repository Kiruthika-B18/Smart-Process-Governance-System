from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Text, Float
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from .database import Base

class UserRole(str, enum.Enum):
    FARMER = "Farmer"
    VILLAGE_OFFICER = "VillageOfficer"
    BLOCK_OFFICER = "BlockOfficer"
    DISTRICT_OFFICER = "DistrictOfficer"
    DIRECTOR = "Director" # System Admin

class RequestStatus(str, enum.Enum):
    PENDING_VILLAGE = "Pending_Village"
    PENDING_BLOCK = "Pending_Block"
    PENDING_DISTRICT = "Pending_District"
    APPROVED = "Approved"
    REJECTED = "Rejected"

class UrgencyLevel(str, enum.Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    hashed_password = Column(String(100))
    role = Column(Enum(UserRole))
    manager_id = Column(Integer, ForeignKey("users.id"), nullable=True) # E.g., Farmer -> Village Officer, Village Officer -> Block Officer

    manager = relationship("User", remote_side=[id], backref="subordinates")
    requests = relationship("Request", foreign_keys="Request.submitter_id", back_populates="submitter")
    assigned_requests = relationship("Request", foreign_keys="Request.current_handler_id", back_populates="current_handler")

class Request(Base):
    __tablename__ = "requests"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100))
    description = Column(Text)
    
    # New FPO Fields
    aadhar_number = Column(String(12))
    account_number = Column(String(50))
    land_acreage = Column(Float)
    
    # New Demographics & Land Details
    farmer_name = Column(String(100))
    survey_number = Column(String(50))
    village = Column(String(50))
    taluk = Column(String(50))
    district = Column(String(50))
    land_type = Column(String(50))
    ownership_type = Column(String(50))
    
    # Document Verification
    pan_number = Column(String(50), nullable=True)
    documents_verified = Column(Integer, default=0) # 0 for false, 1 for true


    submitter_id = Column(Integer, ForeignKey("users.id"))
    current_handler_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    status = Column(Enum(RequestStatus), default=RequestStatus.PENDING_VILLAGE)
    urgency = Column(Enum(UrgencyLevel), default=UrgencyLevel.MEDIUM)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    sla_deadline = Column(DateTime)
    rejection_reason = Column(Text, nullable=True)
    expected_delivery_date = Column(DateTime, nullable=True)
    actioned_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    submitter = relationship("User", foreign_keys=[submitter_id], back_populates="requests")
    current_handler = relationship("User", foreign_keys=[current_handler_id], back_populates="assigned_requests")
    actioned_by = relationship("User", foreign_keys=[actioned_by_id])
    audit_logs = relationship("AuditLog", back_populates="request", order_by="AuditLog.timestamp")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("requests.id"))
    action = Column(String(50))
    actor_id = Column(Integer, ForeignKey("users.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    details = Column(Text, nullable=True)

    request = relationship("Request", back_populates="audit_logs")

class SystemConfig(Base):
    __tablename__ = "system_config"

    key = Column(String(50), primary_key=True)
    value = Column(String(255))
