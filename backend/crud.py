from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from . import models, schemas, auth

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def get_managers(db: Session):
    return db.query(models.User).filter(models.User.role.in_([models.UserRole.VILLAGE_OFFICER, models.UserRole.BLOCK_OFFICER])).all()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(
        username=user.username,
        hashed_password=hashed_password,
        role=user.role,
        manager_id=user.manager_id
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def reset_password(db: Session, user_id: int, new_password: str):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        return None
    db_user.hashed_password = auth.get_password_hash(new_password)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_sla_minutes(db: Session):
    config = db.query(models.SystemConfig).filter(models.SystemConfig.key == "sla_minutes").first()
    return int(config.value) if config else 10 # Default 10 minutes

def create_request(db: Session, request: schemas.RequestCreate, user_id: int):
    # Calculate SLA deadline
    sla_minutes = get_sla_minutes(db)
    deadline = datetime.utcnow() + timedelta(minutes=sla_minutes)
    
    db_request = models.Request(
        title=request.title,
        description=request.description,
        urgency=request.urgency,
        aadhar_number=request.aadhar_number,
        account_number=request.account_number,
        land_acreage=request.land_acreage,
        farmer_name=request.farmer_name,
        survey_number=request.survey_number,
        village=request.village,
        taluk=request.taluk,
        district=request.district,
        land_type=request.land_type,
        ownership_type=request.ownership_type,
        submitter_id=user_id,
        status=models.RequestStatus.PENDING_VILLAGE,
        sla_deadline=deadline
    )
    return db_request

def get_requests_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Request).filter(models.Request.submitter_id == user_id).order_by(models.Request.id.desc()).offset(skip).limit(limit).all()

def get_requests_by_handler(db: Session, handler_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Request).filter(models.Request.current_handler_id == handler_id).order_by(models.Request.id.desc()).offset(skip).limit(limit).all()

def update_request_status(db: Session, request: models.Request, status: models.RequestStatus, reason: str = None):
    request.status = status
    if reason:
        request.rejection_reason = reason
    request.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(request)
    return request
