from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import models
import database
from routers import auth, requests, admin
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

import os
os.makedirs("backend/uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="backend/uploads"), name="uploads")

from fastapi.responses import JSONResponse
from fastapi.requests import Request

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"Global Exception: {exc}")
    import traceback
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error. Please contact support."},
    )

# SLA Monitoring
def check_sla_violations():
    db = database.SessionLocal()
    try:
        now = datetime.utcnow()
        # Find all pending requests that have missed their SLA
        expired_requests = db.query(models.Request).filter(
            models.Request.status.in_([
                models.RequestStatus.PENDING_VILLAGE, 
                models.RequestStatus.PENDING_BLOCK
            ]),
            models.Request.sla_deadline < now
        ).all()
        
        import random
        for req in expired_requests:
            
            # Tier 1 Miss: Village -> Escalate to Block
            if req.status == models.RequestStatus.PENDING_VILLAGE:
                req.status = models.RequestStatus.PENDING_BLOCK
                blocks = db.query(models.User).filter(models.User.role == models.UserRole.BLOCK_OFFICER).all()
                if blocks:
                    chosen = random.choice(blocks)
                    req.current_handler_id = chosen.id
                    req.updated_at = now
                    # Add 10 minutes for the new tier
                    req.sla_deadline = now + timedelta(minutes=10)
                    
                    audit = models.AuditLog(
                        request_id=req.id,
                        action="ESCALATED_TO_BLOCK",
                        actor_id=None, # System
                        details=f"Village SLA exceeded. Auto-escalated to Block Officer {chosen.username}"
                    )
                    db.add(audit)
                    
            # Tier 2 Miss: Block -> Escalate to District
            elif req.status == models.RequestStatus.PENDING_BLOCK:
                req.status = models.RequestStatus.PENDING_DISTRICT
                districts = db.query(models.User).filter(models.User.role == models.UserRole.DISTRICT_OFFICER).all()
                if districts:
                    chosen = random.choice(districts)
                    req.current_handler_id = chosen.id
                    req.updated_at = now
                    # District is final, no further SLA escalation
                    req.sla_deadline = None 
                    
                    audit = models.AuditLog(
                        request_id=req.id,
                        action="ESCALATED_TO_DISTRICT",
                        actor_id=None, # System
                        details=f"Block SLA exceeded. Auto-escalated to District Officer {chosen.username}"
                    )
                    db.add(audit)
                else:
                    # Fallback if no district officer
                    directors = db.query(models.User).filter(models.User.role == models.UserRole.DIRECTOR).all()
                    if directors:
                        chosen = random.choice(directors)
                        req.current_handler_id = chosen.id
                        req.updated_at = now
                        req.sla_deadline = None
                        audit = models.AuditLog(
                            request_id=req.id,
                            action="ESCALATED_TO_DIRECTOR",
                            actor_id=None,
                            details="Block SLA exceeded. No District Officer found, auto-escalated to Director."
                        )
                        db.add(audit)
        
        if expired_requests:
            db.commit()
            print(f"Escalated {len(expired_requests)} delayed agricultural requests.")
            
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
