import pymysql
from werkzeug.security import generate_password_hash

DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'amulet_system',
    'charset': 'utf8mb4'
}

conn = pymysql.connect(**DB_CONFIG)
cursor = conn.cursor()

cursor.execute("DELETE FROM users WHERE email = 'admin@test.com'")
password_hash = generate_password_hash('admin123')

cursor.execute("""
    INSERT INTO users (name, email, password_hash, role, is_active, blessing_points, created_at)
    VALUES (%s, %s, %s, %s, %s, %s, NOW())
""", ('Admin', 'admin@test.com', password_hash, 'admin', 1, 0))

user_id = cursor.lastrowid
print(f"Created admin user (ID: {user_id}, role: admin)")

cursor.execute("SHOW TABLES LIKE 'temple_admins'")
if cursor.fetchone():
    cursor.execute("""
        INSERT INTO temple_admins (user_id, temple_id, role, is_active, created_at)
        VALUES (%s, %s, %s, %s, NOW())
    """, (user_id, 1, 'admin', 1))
    print("Added to temple_admins for temple_id=1")

conn.commit()
cursor.close()
conn.close()

print("\nEmail: admin@test.com")
print("Password: admin123")
print("Role: admin (can create temples)")
