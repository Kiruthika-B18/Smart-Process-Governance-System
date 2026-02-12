from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import database, schemas, models, auth, crud

router = APIRouter(
    prefix="/admin",
    tags=["admin"]
)

@router.post("/users", response_model=schemas.UserOut)
def create_user(user: schemas.UserCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    if current_user.role != models.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    return crud.create_user(db=db, user=user)

@router.post("/config/sla")
def set_sla(minutes: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    if current_user.role != models.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    config = db.query(models.SystemConfig).filter(models.SystemConfig.key == "sla_minutes").first()
    if not config:
        config = models.SystemConfig(key="sla_minutes", value=str(minutes))
        db.add(config)
    else:
        config.value = str(minutes)
    db.commit()
    return {"message": f"SLA updated to {minutes} minutes"}
