from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from .database import Base

class UserRole(str, enum.Enum):
    EMPLOYEE = "Employee"
    MANAGER = "Manager"
    BACKUP_MANAGER = "BackupManager"
    ADMIN = "Administrator"

class RequestStatus(str, enum.Enum):
    PENDING = "Pending"
    APPROVED = "Approved"
    REJECTED = "Rejected"
    ESCALATED = "Escalated"

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
    manager_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    manager = relationship("User", remote_side=[id], backref="subordinates")
    # We use string references for Request to avoid circular import issues or definition order issues
    requests = relationship("Request", foreign_keys="Request.submitter_id", back_populates="submitter")
    assigned_requests = relationship("Request", foreign_keys="Request.current_handler_id", back_populates="current_handler")

class Request(Base):
    __tablename__ = "requests"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100))
    description = Column(Text)
    submitter_id = Column(Integer, ForeignKey("users.id"))
    current_handler_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    status = Column(Enum(RequestStatus), default=RequestStatus.PENDING)
    urgency = Column(Enum(UrgencyLevel), default=UrgencyLevel.MEDIUM)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    sla_deadline = Column(DateTime)
    rejection_reason = Column(Text, nullable=True)
    actioned_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    submitter = relationship("User", foreign_keys=[submitter_id], back_populates="requests")
    current_handler = relationship("User", foreign_keys=[current_handler_id], back_populates="assigned_requests")
    actioned_by = relationship("User", foreign_keys=[actioned_by_id])

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("requests.id"))
    action = Column(String(50))
    actor_id = Column(Integer, ForeignKey("users.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    details = Column(Text, nullable=True)

class SystemConfig(Base):
    __tablename__ = "system_config"

    key = Column(String(50), primary_key=True)
    value = Column(String(255))
