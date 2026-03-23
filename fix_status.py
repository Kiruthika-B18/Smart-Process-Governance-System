import sqlite3

conn = sqlite3.connect('C:/Users/kirut/Downloads/Projects/SPGS-3/spgs_db.sqlite')
c = conn.cursor()

try:
    c.execute("UPDATE requests SET status = 'PENDING_BLOCK' WHERE status = 'Pending_Block'")
    c.execute("UPDATE requests SET status = 'PENDING_DISTRICT' WHERE status = 'Pending_District'")
    c.execute("UPDATE requests SET status = 'PENDING_VILLAGE' WHERE status = 'Pending_Village'")
    c.execute("UPDATE requests SET status = 'APPROVED' WHERE status = 'Approved'")
    c.execute("UPDATE requests SET status = 'REJECTED' WHERE status = 'Rejected'")
    
    conn.commit()
    print('Request statuses reverted to uppercase enum names successfully!')
except Exception as e:
    print('Error:', e)
finally:
    conn.close()
