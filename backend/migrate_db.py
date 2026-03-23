import sqlite3
import os

db_path = 'spgs_db.sqlite'
print(f'Using db at: {os.path.abspath(db_path)}')

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    columns = [
        ('farmer_name', 'VARCHAR(100)'),
        ('survey_number', 'VARCHAR(50)'),
        ('village', 'VARCHAR(50)'),
        ('taluk', 'VARCHAR(50)'),
        ('district', 'VARCHAR(50)'),
        ('land_type', 'VARCHAR(50)'),
        ('ownership_type', 'VARCHAR(50)')
    ]
    for col_name, col_type in columns:
        try:
            cursor.execute(f'ALTER TABLE requests ADD COLUMN {col_name} {col_type}')
            print(f'Added column {col_name}')
        except sqlite3.OperationalError as e:
            if 'duplicate column name' in str(e).lower():
                print(f'Column {col_name} already exists')
            else:
                print(f'Error adding {col_name}: {e}')
    conn.commit()
    print('Migration complete!')
except Exception as e:
    print(f'Critical error: {e}')
finally:
    if conn:
        conn.close()
