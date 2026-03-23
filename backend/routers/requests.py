from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import database, schemas, models, auth, crud
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/requests",
    tags=["requests"]
)

@router.post("/", response_model=schemas.RequestOut)
def create_request(
    request: schemas.RequestCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    try:
        if current_user.role != models.UserRole.FARMER:
            raise HTTPException(status_code=403, detail="Only Farmers can submit requests.")

        if request.target_manager_id:
            target_manager = db.query(models.User).filter(models.User.id == request.target_manager_id).first()
            if not target_manager:
                raise HTTPException(status_code=400, detail="Target Village Officer ID not found")

            if target_manager.role != models.UserRole.VILLAGE_OFFICER:
                raise HTTPException(status_code=400, detail=f"Target user role '{target_manager.role}' is not a Village Officer")
            handler_id = target_manager.id
        else:
            handler_id = current_user.manager_id

            if not handler_id:
                fallback = db.query(models.User).filter(
                    models.User.role == models.UserRole.VILLAGE_OFFICER
                ).first()
                if fallback:
                    handler_id = fallback.id
                else:
                    raise HTTPException(status_code=400, detail="No Village Officer available to process request")

        new_request = crud.create_request(db=db, request=request, user_id=current_user.id)
        db.add(new_request)
        db.flush() # Get the new_request.id
        
        new_request.pan_number = request.pan_number
        
        new_request.current_handler_id = handler_id
        db.commit()
        db.refresh(new_request)
        logger.info(f"Agricultural Request #{new_request.id} created by Farmer '{current_user.username}'")
        return new_request
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Unexpected error creating request for user '{current_user.username}': {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/", response_model=List[schemas.RequestOut])
def read_requests(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.role == models.UserRole.FARMER:
        requests = crud.get_requests_by_user(db, user_id=current_user.id, skip=skip, limit=limit)
    elif current_user.role in [models.UserRole.VILLAGE_OFFICER, models.UserRole.BLOCK_OFFICER, models.UserRole.DISTRICT_OFFICER]:
        # Get active requests in their queue
        queue_requests = crud.get_requests_by_handler(db, handler_id=current_user.id, skip=skip, limit=limit)
        
        # Get requests they previously escalated/approved that are still pending somewhere above them
        audit_logs = db.query(models.AuditLog.request_id).filter(
            models.AuditLog.actor_id == current_user.id,
            models.AuditLog.action.in_(["APPROVED_VILLAGE", "APPROVED_BLOCK", "ESCALATED"])
        ).distinct().all()
        
        escalated_ids = [log[0] for log in audit_logs]
        escalated_requests = []
        if escalated_ids:
            escalated_requests = db.query(models.Request).filter(
                models.Request.id.in_(escalated_ids),
                models.Request.status.in_([models.RequestStatus.PENDING_BLOCK, models.RequestStatus.PENDING_DISTRICT])
            ).order_by(models.Request.id.desc()).all()
            
        # Combine and deduplicate
        all_requests_dict = {req.id: req for req in queue_requests + escalated_requests}
        requests = list(all_requests_dict.values())
        requests.sort(key=lambda r: r.id, reverse=True)
    elif current_user.role == models.UserRole.DIRECTOR:
        requests = db.query(models.Request).order_by(models.Request.id.desc()).offset(skip).limit(limit).all()
    else:
        requests = []

    for req in requests:
        if req.current_handler_id:
            handler = db.query(models.User).filter(models.User.id == req.current_handler_id).first()
            req.handler_username = handler.username if handler else None
        else:
            req.handler_username = None

        if req.actioned_by_id:
            actor = db.query(models.User).filter(models.User.id == req.actioned_by_id).first()
            req.actioned_by_username = actor.username if actor else None
        else:
            req.actioned_by_username = None

        if req.submitter_id:
            submitter = db.query(models.User).filter(models.User.id == req.submitter_id).first()
            req.submitter_username = submitter.username if submitter else None
        else:
            req.submitter_username = None

    return requests

@router.get("/history", response_model=List[schemas.RequestOut])
def get_request_history(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.role == models.UserRole.FARMER:
        raise HTTPException(status_code=403, detail="Farmers use the main requests endpoint.")
        
    # Find all unique request IDs where this officer is the actor in the audit logs
    audit_logs = db.query(models.AuditLog.request_id).filter(
        models.AuditLog.actor_id == current_user.id
    ).distinct().all()
    
    request_ids = [log[0] for log in audit_logs]
    
    if not request_ids:
        return []
        
    requests = db.query(models.Request).filter(
        models.Request.id.in_(request_ids)
    ).order_by(models.Request.id.desc()).offset(skip).limit(limit).all()
    
    for req in requests:
        if req.current_handler_id:
            handler = db.query(models.User).filter(models.User.id == req.current_handler_id).first()
            req.handler_username = handler.username if handler else None
        else:
            req.handler_username = None

        if req.actioned_by_id:
            actor = db.query(models.User).filter(models.User.id == req.actioned_by_id).first()
            req.actioned_by_username = actor.username if actor else None
        else:
            req.actioned_by_username = None

        if req.submitter_id:
            submitter = db.query(models.User).filter(models.User.id == req.submitter_id).first()
            req.submitter_username = submitter.username if submitter else None
        else:
            req.submitter_username = None

    return requests


def get_sla_minutes(db: Session):
    config = db.query(models.SystemConfig).filter(models.SystemConfig.key == "sla_minutes").first()
    return int(config.value) if config else 10


@router.put("/{request_id}/status", response_model=schemas.RequestOut)
def update_request_status(
    request_id: int,
    update_data: schemas.RequestUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    request = db.query(models.Request).filter(models.Request.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    if request.current_handler_id != current_user.id and current_user.role != models.UserRole.DIRECTOR:
        raise HTTPException(status_code=403, detail="Not authorized to approve/reject this request")

    if update_data.action not in ["APPROVE", "REJECT"]:
        raise HTTPException(status_code=400, detail="Invalid action. Must be APPROVE or REJECT.")

    action_taken = ""

    # Tiered Approval Logic
    if update_data.action == "REJECT":
        if not update_data.rejection_reason:
            raise HTTPException(status_code=400, detail="Rejection reason is required")
        request.status = models.RequestStatus.REJECTED
        request.rejection_reason = update_data.rejection_reason
        request.actioned_by_id = current_user.id
        action_taken = "REJECTED"
        
    elif update_data.action == "APPROVE":
        if current_user.role == models.UserRole.VILLAGE_OFFICER:
            if not request.documents_verified:
                raise HTTPException(status_code=400, detail="Documents must be verified before approval")
                
            # Move to Block Officer
            request.status = models.RequestStatus.PENDING_BLOCK
            request.actioned_by_id = current_user.id
            request.sla_deadline = datetime.utcnow() + timedelta(minutes=get_sla_minutes(db))
            action_taken = "APPROVED_VILLAGE"
            
            # Find a block officer (in a real system, look up the geographical mapping)
            block_officer = db.query(models.User).filter(models.User.role == models.UserRole.BLOCK_OFFICER).first()
            if block_officer:
                request.current_handler_id = block_officer.id
            else:
                raise HTTPException(status_code=500, detail="No Block Officer found to forward request to.")
                
        elif current_user.role == models.UserRole.BLOCK_OFFICER:
            # Move to District Officer
            request.status = models.RequestStatus.PENDING_DISTRICT
            request.actioned_by_id = current_user.id
            request.sla_deadline = datetime.utcnow() + timedelta(minutes=get_sla_minutes(db))
            action_taken = "APPROVED_BLOCK"
            
            # Find a district officer
            district_officer = db.query(models.User).filter(models.User.role == models.UserRole.DISTRICT_OFFICER).first()
            if district_officer:
                request.current_handler_id = district_officer.id
            else:
                raise HTTPException(status_code=500, detail="No District Officer found to forward request to.")
                
        elif current_user.role == models.UserRole.DISTRICT_OFFICER or current_user.role == models.UserRole.DIRECTOR:
            # Final Approval
            if not update_data.expected_delivery_date:
                raise HTTPException(status_code=400, detail="Expected delivery date is required for final District approval")
            
            request.status = models.RequestStatus.APPROVED
            request.actioned_by_id = current_user.id
            request.current_handler_id = None # Workflow complete
            request.expected_delivery_date = update_data.expected_delivery_date
            action_taken = "APPROVED_FINAL"
            
            # Notify Farmer
            farmer = db.query(models.User).filter(models.User.id == request.submitter_id).first()
            logger.info(f"*** SMS NOTIFICATION TRIGGERED ***")
            logger.info(f"To: Farmer {farmer.username} (ID: {farmer.id})")
            logger.info(f"Message: Your application for '{request.title}' (Aadhar: ****{request.aadhar_number[-4:]}) has been APPROVED by the District Office. Supply is granted.")
            logger.info(f"**********************************")

    request.updated_at = datetime.utcnow()

    audit = models.AuditLog(
        request_id=request.id,
        action=action_taken,
        actor_id=current_user.id,
        details=update_data.rejection_reason or f"Approved at {current_user.role} level"
    )
    db.add(audit)
    db.commit()
    db.refresh(request)
    logger.info(f"Agricultural Request #{request.id} {action_taken} by '{current_user.username}'")
    return request

@router.put("/{request_id}/verify", response_model=schemas.RequestOut)
def verify_documents(
    request_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.role != models.UserRole.VILLAGE_OFFICER:
        raise HTTPException(status_code=403, detail="Only Village Officers can verify documents")
        
    request = db.query(models.Request).filter(models.Request.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
        
    if request.current_handler_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to verify this request")
        
    request.documents_verified = 1  # 1 for True in SQLite Integer representation (or True for Boolean)
    request.updated_at = datetime.utcnow()
    
    audit = models.AuditLog(
        request_id=request.id,
        action="DOCUMENTS_VERIFIED",
        actor_id=current_user.id,
        details="Village Officer manually verified PAN, Aadhar, and Survey Numbers."
    )
    db.add(audit)
    db.commit()
    db.refresh(request)
    logger.info(f"Request #{request_id} documents verified by '{current_user.username}'")
    return request

@router.put("/{request_id}", response_model=schemas.RequestOut)
def edit_request(
    request_id: int,
    request_update: schemas.RequestEdit,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    request = db.query(models.Request).filter(models.Request.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    if request.submitter_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this request")

    if request.status != models.RequestStatus.PENDING_VILLAGE:
        raise HTTPException(status_code=400, detail="Cannot edit request once it has been processed by the Village Officer")

    if request_update.title:
        request.title = request_update.title
    if request_update.description:
        request.description = request_update.description
    if request_update.urgency:
        request.urgency = request_update.urgency
    if request_update.aadhar_number:
        request.aadhar_number = request_update.aadhar_number
    if request_update.account_number:
        request.account_number = request_update.account_number
    if request_update.land_acreage:
        request.land_acreage = request_update.land_acreage

    if request_update.target_manager_id:
        target_manager = db.query(models.User).filter(models.User.id == request_update.target_manager_id).first()
        if not target_manager:
            raise HTTPException(status_code=400, detail="Target Village Officer ID not found")

        if target_manager.role != models.UserRole.VILLAGE_OFFICER:
            raise HTTPException(status_code=400, detail="Target user is not a Village Officer")

        request.current_handler_id = target_manager.id

    request.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(request)
    logger.info(f"Agricultural Request #{request_id} edited by Farmer '{current_user.username}'")
    return request
