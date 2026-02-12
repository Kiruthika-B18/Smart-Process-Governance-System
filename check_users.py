from backend import database, models
from sqlalchemy.orm import Session

db = database.SessionLocal()
users = db.query(models.User).all()

print(f"{'ID':<5} {'Username':<20} {'Role':<20} {'ManagerID':<10}")
print("-" * 60)
for user in users:
    print(f"{user.id:<5} {user.username:<20} {user.role.value:<20} {user.manager_id or 'None':<10}")

db.close()
