import sqlite3

conn = sqlite3.connect('C:/Users/kirut/Downloads/Projects/SPGS-3/spgs_db.sqlite')
c = conn.cursor()

try:
    c.execute("UPDATE users SET role = 'Director' WHERE role = 'DIRECTOR'")
    c.execute("UPDATE users SET role = 'DistrictOfficer' WHERE role = 'DISTRICT_OFFICER'")
    c.execute("UPDATE users SET role = 'BlockOfficer' WHERE role = 'BLOCK_OFFICER'")
    c.execute("UPDATE users SET role = 'VillageOfficer' WHERE role = 'VILLAGE_OFFICER'")
    c.execute("UPDATE users SET role = 'Farmer' WHERE role = 'FARMER'")
    
    # Also adjust request #3 and #4 to the correct handler if they stuck, but actually the handler is 2 (DistrictOfficer).
    # What about those stuck requests? Let's assign current_handler_id for PENDING_BLOCK (none) and PENDING_DISTRICT. 
    # Request 3 and 4 are PENDING_DISTRICT. BlockOfficer (3) acted on 3, VillageOfficer (4) acted on 4. Wait, 4 jumped straight to District. Let's fix 4.
    c.execute("UPDATE requests SET status = 'Pending_Block', current_handler_id = 3 WHERE id = 4")
    
    conn.commit()
    print('Users and stuck requests updated successfully!')
except Exception as e:
    print('Error:', e)
finally:
    conn.close()
