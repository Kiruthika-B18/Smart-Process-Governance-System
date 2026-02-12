from backend.database import SessionLocal, engine, Base
from backend import models, auth
import sys

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

def create_admin():
    db = SessionLocal()
    
    # Check if admin exists
    existing_admin = db.query(models.User).filter(models.User.username == "admin").first()
    if existing_admin:
        print("Admin user already exists.")
        db.close()
        return

    user = models.User(
        username="admin", 
        hashed_password=auth.get_password_hash("admin123"), 
        role=models.UserRole.ADMIN.value
    )
    db.add(user)
    db.commit()
    print("Admin user created with username 'admin' and password 'admin123'")
    db.close()

if __name__ == "__main__":
    create_admin()
