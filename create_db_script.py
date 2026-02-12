import pymysql

# Update these credentials to match your MySQL server
DB_HOST = "localhost"
DB_USER = "root"
DB_PASSWORD = "password" # Change this
DB_NAME = "spgs_db"

def create_database():
    try:
        connection = pymysql.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD
        )
        cursor = connection.cursor()
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME}")
        print(f"Database '{DB_NAME}' created successfully (or already exists).")
        connection.close()
    except Exception as e:
        print(f"Error creating database: {e}")
        print("Please check your credentials in this script.")

if __name__ == "__main__":
    create_database()
