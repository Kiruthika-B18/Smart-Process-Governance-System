import requests
import json
import base64

BASE_URL = "http://localhost:8000"

def decode_jwt_payload(token):
    try:
        payload_part = token.split('.')[1]
        # Fix padding
        payload_part += '=' * (-len(payload_part) % 4)
        decoded_bytes = base64.urlsafe_b64decode(payload_part)
        return json.loads(decoded_bytes)
    except Exception as e:
        print(f"Token decode error: {e}")
        return {}

def test_login(username, password):
    print(f"\nAttempting login for {username}...")
    try:
        response = requests.post(f"{BASE_URL}/auth/login", data={
            "username": username,
            "password": password
        })
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            token = data.get("access_token")
            print("Login Successful!")
            
            payload = decode_jwt_payload(token)
            print("Token Payload:", json.dumps(payload, indent=2))
            
            role = payload.get("role")
            print(f"Role in Token: '{role}'")
            
        else:
            print(f"Login Failed: {response.text}")
            
    except Exception as e:
        print(f"Request Error: {e}")

if __name__ == "__main__":
    # Test with Keerthi (Employee)
    test_login("Keerthi", "password123")
    
    # Test with Admin
    test_login("admin", "admin123")
