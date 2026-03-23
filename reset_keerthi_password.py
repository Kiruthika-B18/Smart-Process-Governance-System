from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from backend.database import engine
from backend.models import User, UserRole
from backend.auth import get_password_hash

def reset_keerthi():
    with Session(engine) as db:
        user = db.query(User).filter(User.username == "Keerthi").first()
        if not user:
            print("User 'Keerthi' not found!")
            return

        print(f"Found user: {user.username} with Role: {user.role}")
        
        # Force update password
        new_hash = get_password_hash("password123")
        user.hashed_password = new_hash
        
        # Ensure role is correct (UPPERCASE for backend Enum match)
        # We previously reverted to UPPERCASE in the DB, so we should stick to that if that's what the model expects.
        # But wait, if models.py defines Enum with values "Employee", "Manager" etc, then the DB should be Title Case?
        # Let's check models.py again in a second tool call to be sure about the Enum definition. 
        # For now just update password.
        
        db.commit()
        print("Password for 'Keerthi' reset to 'password123'.")

if __name__ == "__main__":
    reset_keerthi()
