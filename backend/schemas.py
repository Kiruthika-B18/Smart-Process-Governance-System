from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from .models import UserRole, RequestStatus, UrgencyLevel

class UserBase(BaseModel):
    username: str
    role: UserRole

class UserCreate(UserBase):
    password: str
    manager_id: Optional[int] = None

class UserOut(UserBase):
    id: int
    manager_id: Optional[int] = None

    class Config:
        from_attributes = True

class RequestBase(BaseModel):
    title: str
    description: str
    urgency: Optional[UrgencyLevel] = UrgencyLevel.MEDIUM
    aadhar_number: str = Field(..., description="12 digit matching Aadhar Card")
    account_number: str
    land_acreage: float = Field(..., gt=0, description="Land owned in acres")
    
    farmer_name: str
    survey_number: str
    village: str
    taluk: str
    district: str
    land_type: str
    ownership_type: str

class RequestCreate(RequestBase):
    target_manager_id: Optional[int] = None # Farmer assigning directly to Village Officer
    pan_number: Optional[str] = None

class RequestEdit(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    urgency: Optional[UrgencyLevel] = None
    aadhar_number: Optional[str] = None
    account_number: Optional[str] = None
    land_acreage: Optional[float] = None
    target_manager_id: Optional[int] = None
    
    farmer_name: Optional[str] = None
    survey_number: Optional[str] = None
    village: Optional[str] = None
    taluk: Optional[str] = None
    district: Optional[str] = None
    land_type: Optional[str] = None
    ownership_type: Optional[str] = None

class RequestUpdate(BaseModel):
    action: str = Field(..., description="Either 'APPROVE' or 'REJECT'")
    rejection_reason: Optional[str] = None
    expected_delivery_date: Optional[datetime] = None

class AuditLogOut(BaseModel):
    id: int
    request_id: int
    action: str
    actor_id: Optional[int]
    timestamp: datetime
    details: Optional[str] = None

    class Config:
        from_attributes = True

class RequestOut(BaseModel):
    id: int
    title: str
    description: str
    urgency: UrgencyLevel
    aadhar_number: str
    account_number: str
    land_acreage: float
    
    farmer_name: Optional[str] = None
    survey_number: Optional[str] = None
    village: Optional[str] = None
    taluk: Optional[str] = None
    district: Optional[str] = None
    land_type: Optional[str] = None
    ownership_type: Optional[str] = None
    
    pan_number: Optional[str] = None
    documents_verified: bool = False
    
    submitter_id: int
    submitter_username: Optional[str] = None
    current_handler_id: Optional[int]
    handler_username: Optional[str] = None
    status: RequestStatus
    created_at: datetime
    updated_at: datetime
    sla_deadline: Optional[datetime] = None
    expected_delivery_date: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    actioned_by_username: Optional[str] = None
    audit_logs: List[AuditLogOut] = []

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class PasswordReset(BaseModel):
    password: str
