import sqlite3
import sqlalchemy

conn = sqlite3.connect('C:/Users/kirut/Downloads/Projects/SPGS-3/spgs_db.sqlite')
c = conn.cursor()

try:
    # Fix Request Statuses
    c.execute("UPDATE requests SET status = 'PENDING_VILLAGE' WHERE status COLLATE NOCASE = 'pending_village'")
    c.execute("UPDATE requests SET status = 'PENDING_BLOCK' WHERE status COLLATE NOCASE = 'pending_block'")
    c.execute("UPDATE requests SET status = 'PENDING_DISTRICT' WHERE status COLLATE NOCASE = 'pending_district'")
    c.execute("UPDATE requests SET status = 'APPROVED' WHERE status COLLATE NOCASE = 'approved'")
    c.execute("UPDATE requests SET status = 'REJECTED' WHERE status COLLATE NOCASE = 'rejected'")
    
    # Fix User Roles
    c.execute("UPDATE users SET role = 'FARMER' WHERE role COLLATE NOCASE = 'farmer'")
    c.execute("UPDATE users SET role = 'VILLAGE_OFFICER' WHERE role COLLATE NOCASE = 'villageofficer'")
    c.execute("UPDATE users SET role = 'BLOCK_OFFICER' WHERE role COLLATE NOCASE = 'blockofficer'")
    c.execute("UPDATE users SET role = 'DISTRICT_OFFICER' WHERE role COLLATE NOCASE = 'districtofficer'")
    c.execute("UPDATE users SET role = 'DIRECTOR' WHERE role COLLATE NOCASE = 'director'")

    conn.commit()
    print('Successfully restored Database to SQLAlchemy UPPERCASE Enum compliance.')
except Exception as e:
    print('Error:', e)
finally:
    conn.close()
