from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Assuming SQLite for now based on previous file list 'spgs_db.sqlite'
SQLALCHEMY_DATABASE_URL = "sqlite:///./spgs_db.sqlite"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def dump_users():
    db = SessionLocal()
    try:
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
    dump_users()
