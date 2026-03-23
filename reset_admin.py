from sqlalchemy.orm import Session
from backend.database import engine
from backend.models import User
from backend.auth import get_password_hash

def reset_admin():
    with Session(engine) as db:
        user = db.query(User).filter(User.username == "admin").first()
        if not user:
            print("User 'admin' not found!")
            return

        print(f"Found user: {user.username}")
        user.hashed_password = get_password_hash("admin123")
        db.commit()
        print("Password for 'admin' reset to 'admin123'.")

if __name__ == "__main__":
    reset_admin()
