import sqlite3

def check_admin():
    conn = sqlite3.connect('spgs_db.sqlite')
    cursor = conn.cursor()
    cursor.execute("SELECT id, username, role FROM users WHERE username='admin'")
    row = cursor.fetchone()
    print(f"Admin User Info: {row}")
    conn.close()

if __name__ == "__main__":
    check_admin()
