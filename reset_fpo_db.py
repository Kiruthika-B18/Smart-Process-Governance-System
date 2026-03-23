import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.models import Base, User, UserRole, SystemConfig
from backend.auth import get_password_hash
from backend.database import SQLALCHEMY_DATABASE_URL

def reset_database():
    db_path = "./spgs_db.sqlite"
    if os.path.exists(db_path):
        os.remove(db_path)
        print("Deleted existing database.")

    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()

    try:
        # 1. Create Director (Admin)
        director = User(
            username="director",
            hashed_password=get_password_hash("password123"),
            role=UserRole.DIRECTOR
        )
        db.add(director)
        db.commit()
        db.refresh(director)
        print("Created Director: username=director, password=password123")

        # 2. Create District Officer (Level 3 Approver)
        district = User(
            username="district_officer",
            hashed_password=get_password_hash("password123"),
            role=UserRole.DISTRICT_OFFICER,
            manager_id=director.id
        )
        db.add(district)
        db.commit()
        db.refresh(district)
        print("Created District Officer: username=district_officer, password=password123")

        # 3. Create Block Officer (Level 2 Approver)
        block = User(
            username="block_officer",
            hashed_password=get_password_hash("password123"),
            role=UserRole.BLOCK_OFFICER,
            manager_id=district.id
        )
        db.add(block)
        db.commit()
        db.refresh(block)
        print("Created Block Officer: username=block_officer, password=password123")
        
        # 4. Create Village Officer (Level 1 Approver)
        village = User(
            username="village_officer",
            hashed_password=get_password_hash("password123"),
            role=UserRole.VILLAGE_OFFICER,
            manager_id=block.id
        )
        db.add(village)
        db.commit()
        db.refresh(village)
        print("Created Village Officer: username=village_officer, password=password123")

        # 5. Create Farmer (Submitter)
        farmer = User(
            username="farmer_ravi",
            hashed_password=get_password_hash("123456789012"), # Using Aadhar as password
            role=UserRole.FARMER,
            manager_id=village.id
        )
        db.add(farmer)
        db.commit()
        print("Created Farmer: username=farmer_ravi, password=123456789012 (Aadhar)")

        # Add SLA config (1 minute for rapid testing)
        config = SystemConfig(key="sla_minutes", value="1")
        db.add(config)
        db.commit()
        print("Set SLA testing deadline to 1 minute.")

        print("Database initialized successfully for FPO Workflow.")
    except Exception as e:
        print(f"Error initializing DB: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    reset_database()
