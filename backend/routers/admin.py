from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import database, schemas, models, auth, crud

router = APIRouter(
    prefix="/admin",
    tags=["admin"]
)

@router.post("/users", response_model=schemas.UserOut)
def create_user(user: schemas.UserCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    if current_user.role != models.UserRole.DIRECTOR:
        raise HTTPException(status_code=403, detail="Not authorized")
    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    return crud.create_user(db=db, user=user)

@router.get("/users", response_model=list[schemas.UserOut])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    if current_user.role != models.UserRole.DIRECTOR:
        raise HTTPException(status_code=403, detail="Not authorized")
    return crud.get_users(db, skip=skip, limit=limit)

@router.put("/users/{user_id}/reset-password")
def reset_user_password(user_id: int, reset: schemas.PasswordReset, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    if current_user.role != models.UserRole.DIRECTOR:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if len(reset.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long")

    user = crud.reset_password(db=db, user_id=user_id, new_password=reset.password)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "Password reset successfully"}

@router.post("/config/sla")
def set_sla(minutes: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    if current_user.role != models.UserRole.DIRECTOR:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    config = db.query(models.SystemConfig).filter(models.SystemConfig.key == "sla_minutes").first()
    if not config:
        config = models.SystemConfig(key="sla_minutes", value=str(minutes))
        db.add(config)
    else:
        config.value = str(minutes)
    db.commit()
    return {"message": f"SLA updated to {minutes} minutes"}

@router.get("/audit-logs", response_model=list[schemas.AuditLogOut])
def read_audit_logs(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    if current_user.role != models.UserRole.DIRECTOR:
        raise HTTPException(status_code=403, detail="Not authorized")
    return db.query(models.AuditLog).order_by(models.AuditLog.timestamp.desc()).offset(skip).limit(limit).all()
