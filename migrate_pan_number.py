import sqlite3

conn = sqlite3.connect("spgs_db.sqlite")
cursor = conn.cursor()

try:
    cursor.execute("ALTER TABLE requests ADD COLUMN pan_number VARCHAR(50)")
except sqlite3.OperationalError as e:
    print("pan_number error:", e)

try:
    cursor.execute("ALTER TABLE requests ADD COLUMN documents_verified INTEGER DEFAULT 0")
except sqlite3.OperationalError as e:
    print("documents_verified error:", e)

conn.commit()
conn.close()
print("Migration complete!")
