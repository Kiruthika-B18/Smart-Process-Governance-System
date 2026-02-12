from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import models, database
from .routers import auth, requests, admin
from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.orm import Session
from datetime import datetime

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Smart Process Governance System")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(requests.router)
app.include_router(admin.router)

# SLA Monitoring
def check_sla_violations():
    db = database.SessionLocal()
    try:
        now = datetime.utcnow()
        expired_requests = db.query(models.Request).filter(
            models.Request.status == models.RequestStatus.PENDING,
            models.Request.sla_deadline < now
        ).all()
        
        for req in expired_requests:
            req.status = models.RequestStatus.ESCALATED
            # Find backup manager
            backup = db.query(models.User).filter(models.User.role == models.UserRole.BACKUP_MANAGER).first()
            if backup:
                req.current_handler_id = backup.id
                req.updated_at = now
                
                # Audit log
                audit = models.AuditLog(
                    request_id=req.id,
                    action="ESCALATED",
                    actor_id=None, # System
                    details="SLA deadline exceeded"
                )
                db.add(audit)
        
        if expired_requests:
            db.commit()
            print(f"Escalated {len(expired_requests)} requests.")
            
    except Exception as e:
        print(f"Error in SLA monitor: {e}")
    finally:
        db.close()

scheduler = BackgroundScheduler()
scheduler.add_job(check_sla_violations, 'interval', minutes=1)
scheduler.start()

@app.on_event("shutdown")
def shutdown_event():
    scheduler.shutdown()

@app.get("/")
def read_root():
    return {"message": "Welcome to SPGS API"}
