from sqlalchemy.orm import Session
from backend.database import engine
from backend.models import User, Request

with Session(engine) as db:
    # Get Users
    manager = db.query(User).filter(User.username == "Kiruthika").first()
    employee = db.query(User).filter(User.username == "Keerthi").first()
    
    print(f"Manager: {manager.username} (ID: {manager.id})")
    print(f"Employee: {employee.username} (ID: {employee.id}, ManagerID: {employee.manager_id})")
    
    # Get Requests
    requests = db.query(Request).all()
    print(f"\nTotal Requests: {len(requests)}")
    
    for req in requests:
        print(f"Request #{req.id}: '{req.title}' | Status: {req.status} | Submitter: {req.submitter_id} | Handler: {req.current_handler_id}")
