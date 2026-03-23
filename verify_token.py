import requests
import jwt # pip install pyjwt

BASE_URL = "http://localhost:8000"

def test_login(username, password):
    print(f"Attempting login for {username}...")
    try:
        response = requests.post(f"{BASE_URL}/auth/login", data={
            "username": username,
            "password": password
        })
        
        if response.status_code == 200:
            token = response.json().get("access_token")
            print("Login Successful!")
            print(f"Token: {token[:20]}...")
            
            # Decode token (without verifying signature for this debug script)
            decoded = jwt.decode(token, options={"verify_signature": False})
            print("\nDecoded Token Payload:")
            print(decoded)
            
            if "role" not in decoded:
                print("CRITICAL: 'role' field missing from token!")
            else:
                print(f"Role found: '{decoded['role']}'")
                
        else:
            print(f"Login Failed: {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    # Create a user first if needed, or assume 'john_doe' exists from previous steps
    # We'll try to login with a known employee if one exists, otherwise we might fail if DB is empty
    # Let's try to register one first to be sure
    
    # Try to register a test emp
    reg_response = requests.post(f"{BASE_URL}/auth/register", json={
        "username": "debug_emp",
        "password": "password123", # > 8 chars
        "role": "Employee"
    })
    if reg_response.status_code == 200:
        print("Created debug_emp")
    elif reg_response.status_code == 400:
        print("debug_emp already exists")
        
    test_login("debug_emp", "password123")
