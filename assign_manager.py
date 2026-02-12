from sqlalchemy.orm import Session
from backend.database import engine
from backend.models import User

with Session(engine) as db:
    employee = db.query(User).filter(User.username == "Keerthi").first()
    manager = db.query(User).filter(User.username == "Kiruthika").first()
    
    if employee and manager:
        employee.manager_id = manager.id
        db.commit()
        print(f"[OK] Assigned {manager.username} (ID: {manager.id}) as manager for {employee.username} (ID: {employee.id})")
    else:
        print("User not found")
