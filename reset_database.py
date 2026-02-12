import os
from backend.database import Base, engine
from backend.models import User, UserRole
from backend.auth import get_password_hash
from sqlalchemy.orm import Session

# Delete existing database tables
print("[OK] Dropping all existing tables...")
Base.metadata.drop_all(bind=engine)
print("[OK] Tables dropped.")

# Create new database
Base.metadata.create_all(bind=engine)
print("[OK] Created new database tables")

# Create admin user
with Session(engine) as db:
    admin = User(
        username="admin",
        hashed_password=get_password_hash("admin123"),
        role=UserRole.ADMIN,
        manager_id=None
    )
    db.add(admin)
    db.commit()
    print(f"[OK] Created admin user (username: admin, password: admin123)")

print("\n[SUCCESS] Database reset complete!")
print("You can now login as admin and create new users.")
