from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import database, schemas, models, auth, crud
from datetime import datetime

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
    print(f"=== REQUEST CREATION START ===")
    print(f"DEBUG: Current user: {current_user.username} (ID: {current_user.id}, Role: {current_user.role})")
    print(f"DEBUG: Request data: title='{request.title}', description='{request.description}'")
    print(f"DEBUG: Target manager ID: {request.target_manager_id}")
    
    try:
        if request.target_manager_id:
            # Validate target manager
            target_manager = db.query(models.User).filter(models.User.id == request.target_manager_id).first()
            if not target_manager:
                print(f"DEBUG: Target Manager ID {request.target_manager_id} not found")
                raise HTTPException(status_code=400, detail="Target manager ID not found")
                
            print(f"DEBUG: Target Manager Role: {target_manager.role} (Type: {type(target_manager.role)})")
            print(f"DEBUG: Allowed Roles: {[models.UserRole.MANAGER, models.UserRole.BACKUP_MANAGER, models.UserRole.ADMIN]}")

            is_allowed = False
            allowed_roles = [models.UserRole.MANAGER, models.UserRole.BACKUP_MANAGER, models.UserRole.ADMIN]
            
            # Robust check for role
            if target_manager.role in allowed_roles:
                is_allowed = True
            elif str(target_manager.role) in [str(r.value) for r in allowed_roles]:
                is_allowed = True
                
            if not is_allowed:
                 print(f"DEBUG: Role check failed for {target_manager.role}")
                 raise HTTPException(status_code=400, detail=f"Target user role '{target_manager.role}' is not a manager or admin")
            handler_id = target_manager.id
            print(f"DEBUG: Using target manager ID: {handler_id}")
        else:
            # Default logic
            print(f"DEBUG: No target manager specified, using default logic")
            handler_id = current_user.manager_id
            print(f"DEBUG: Current user's manager_id: {handler_id}")
            
            if not handler_id:
                # Fallback to Backup Manager or Admin if no manager assigned
                print(f"DEBUG: No manager assigned, looking for fallback admin")
                fallback = db.query(models.User).filter(
                    models.User.role.in_([models.UserRole.BACKUP_MANAGER, models.UserRole.ADMIN])
                ).first()
                if fallback:
                    handler_id = fallback.id
                    print(f"DEBUG: Found fallback: {fallback.username} (ID: {fallback.id}, Role: {fallback.role})")
                else:
                    print(f"DEBUG: NO fallback found!")
                    raise HTTPException(status_code=400, detail="No manager or admin available to process request")

        print(f"DEBUG: Final handler_id: {handler_id}")
        print(f"DEBUG: Creating request via crud.create_request")
        new_request = crud.create_request(db=db, request=request, user_id=current_user.id)
        print(f"DEBUG: Request created, adding to session")
        db.add(new_request)
        print(f"DEBUG: Setting handler_id: {handler_id}")
        new_request.current_handler_id = handler_id
        print(f"DEBUG: Committing to database")
        db.commit()
        db.refresh(new_request)
        print(f"DEBUG: Request created successfully with ID: {new_request.id}")
        print(f"=== REQUEST CREATION SUCCESS ===")
        return new_request
    except HTTPException as he:
        print(f"DEBUG: HTTPException: {he.status_code} - {he.detail}")
        raise
    except Exception as e:
        print(f"DEBUG: Unexpected error: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/", response_model=List[schemas.RequestOut])
def read_requests(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.role == models.UserRole.EMPLOYEE:
        requests = crud.get_requests_by_user(db, user_id=current_user.id, skip=skip, limit=limit)
    elif current_user.role in [models.UserRole.MANAGER, models.UserRole.BACKUP_MANAGER]:
        requests = crud.get_requests_by_handler(db, handler_id=current_user.id, skip=skip, limit=limit)
    elif current_user.role == models.UserRole.ADMIN:
        requests = db.query(models.Request).offset(skip).limit(limit).all()
    else:
        requests = []
    
    # Add handler username to each request
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
    
    # Check if user is the current handler or admin
    if request.current_handler_id != current_user.id and current_user.role != models.UserRole.ADMIN:
         raise HTTPException(status_code=403, detail="Not authorized to approve/reject this request")

    if update_data.status not in [models.RequestStatus.APPROVED, models.RequestStatus.REJECTED]:
        raise HTTPException(status_code=400, detail="Invalid status update")

    request.status = update_data.status
    request.actioned_by_id = current_user.id
    if update_data.status == models.RequestStatus.REJECTED:
        if not update_data.rejection_reason:
             raise HTTPException(status_code=400, detail="Rejection reason is required")
        request.rejection_reason = update_data.rejection_reason
    
    request.updated_at = datetime.utcnow()
    
    # Log audit
    audit = models.AuditLog(
        request_id=request.id,
        action=update_data.status,
        actor_id=current_user.id,
        details=update_data.rejection_reason
    )
    db.add(audit)
    db.commit()
    db.refresh(request)
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
    
    # Check if user is the submitter
    if request.submitter_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this request")

    # Check if status is Pending
    if request.status != models.RequestStatus.PENDING:
        raise HTTPException(status_code=400, detail="Cannot edit request that is not Pending")

    # Update fields
    if request_update.title:
        request.title = request_update.title
    if request_update.description:
        request.description = request_update.description
    if request_update.urgency:
        request.urgency = request_update.urgency
    
    # Handle Manager Re-assignment if changed
    if request_update.target_manager_id:
         # Validate target manager
        target_manager = db.query(models.User).filter(models.User.id == request_update.target_manager_id).first()
        if not target_manager:
            raise HTTPException(status_code=400, detail="Target manager ID not found")
        
        allowed_roles = [models.UserRole.MANAGER, models.UserRole.BACKUP_MANAGER, models.UserRole.ADMIN]
        is_allowed = target_manager.role in allowed_roles or str(target_manager.role) in [str(r.value) for r in allowed_roles]
        
        if not is_allowed:
             raise HTTPException(status_code=400, detail=f"Target user is not a manager")
        
        request.current_handler_id = target_manager.id

    request.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(request)
    return request
