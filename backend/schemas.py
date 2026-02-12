from pydantic import BaseModel
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

class RequestCreate(RequestBase):
    target_manager_id: Optional[int] = None

class RequestEdit(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    urgency: Optional[UrgencyLevel] = None
    target_manager_id: Optional[int] = None

class RequestUpdate(BaseModel):
    status: Optional[RequestStatus] = None
    rejection_reason: Optional[str] = None
    current_handler_id: Optional[int] = None

class RequestOut(BaseModel):
    id: int
    title: str
    description: str
    urgency: UrgencyLevel
    submitter_id: int
    submitter_username: Optional[str] = None
    current_handler_id: Optional[int]
    handler_username: Optional[str] = None
    status: RequestStatus
    created_at: datetime
    updated_at: datetime
    sla_deadline: datetime
    rejection_reason: Optional[str] = None
    actioned_by_username: Optional[str] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
