from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./spgs_db.sqlite"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def fix_roles():
    db = SessionLocal()
    try:
        # Update roles to Title Case
        db.execute(text("UPDATE users SET role = 'Employee' WHERE role = 'EMPLOYEE'"))
        db.execute(text("UPDATE users SET role = 'Manager' WHERE role = 'MANAGER'"))
        db.execute(text("UPDATE users SET role = 'BackupManager' WHERE role = 'BACKUP_MANAGER'"))
        db.execute(text("UPDATE users SET role = 'Administrator' WHERE role = 'ADMIN' OR role = 'ADMINISTRATOR'"))
        
        db.commit()
        print("Roles updated successfully!")
        
        # Verify
        result = db.execute(text("SELECT id, username, role FROM users"))
        print(f"{'ID':<5} {'Username':<20} {'Role':<20}")
        print("-" * 50)
        for row in result:
            print(f"{row[0]:<5} {row[1]:<20} {row[2]:<20}")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    fix_roles()
