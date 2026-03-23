import sqlite3

conn = sqlite3.connect('C:/Users/kirut/Downloads/Projects/SPGS-3/spgs_db.sqlite')
c = conn.cursor()

try:
    c.execute("UPDATE requests SET status = 'Pending_Block' WHERE status = 'PENDING_BLOCK'")
    c.execute("UPDATE requests SET status = 'Pending_District' WHERE status = 'PENDING_DISTRICT'")
    c.execute("UPDATE requests SET status = 'Pending_Village' WHERE status = 'PENDING_VILLAGE'")
    c.execute("UPDATE requests SET status = 'Approved' WHERE status = 'APPROVED'")
    c.execute("UPDATE requests SET status = 'Rejected' WHERE status = 'REJECTED'")
    
    conn.commit()
    print('Request statuses reverted to PascalCase successfully!')
except Exception as e:
    print('Error:', e)
finally:
    conn.close()
