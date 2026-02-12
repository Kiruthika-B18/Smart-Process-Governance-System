from sqlalchemy.orm import Session
from backend.database import engine
from backend.models import User, UserRole
from backend.auth import get_password_hash

with Session(engine) as db:
    # Get Manager
    manager = db.query(User).filter(User.username == "Kiruthika").first()
    if not manager:
        print("[ERROR] Manager 'Kiruthika' not found. Please create manager first.")
        exit(1)
        
    # Check if Employee exists
    employee = db.query(User).filter(User.username == "Keerthi").first()
    if employee:
        print(f"[INFO] Employee 'Keerthi' already exists.")
        if employee.manager_id != manager.id:
            employee.manager_id = manager.id
            db.commit()
            print(f"[OK] Assigned {manager.username} as manager for {employee.username}")
    else:
        # Create Employee
        new_employee = User(
            username="Keerthi",
            hashed_password=get_password_hash("password123"), # Default password
            role=UserRole.EMPLOYEE,
            manager_id=manager.id
        )
        db.add(new_employee)
        db.commit()
        print(f"[SUCCESS] Created employee 'Keerthi' with manager '{manager.username}'")

print("You can now login as 'Keerthi' (password: password123)")
