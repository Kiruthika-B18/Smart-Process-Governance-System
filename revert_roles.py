import sqlite3

conn = sqlite3.connect('C:/Users/kirut/Downloads/Projects/SPGS-3/spgs_db.sqlite')
c = conn.cursor()

try:
    c.execute("UPDATE users SET role = 'DIRECTOR' WHERE role = 'Director'")
    c.execute("UPDATE users SET role = 'DISTRICT_OFFICER' WHERE role = 'DistrictOfficer'")
    c.execute("UPDATE users SET role = 'BLOCK_OFFICER' WHERE role = 'BlockOfficer'")
    c.execute("UPDATE users SET role = 'VILLAGE_OFFICER' WHERE role = 'VillageOfficer'")
    c.execute("UPDATE users SET role = 'FARMER' WHERE role = 'Farmer'")
    
    conn.commit()
    print('Users reverted to uppercase enum names successfully!')
except Exception as e:
    print('Error:', e)
finally:
    conn.close()
