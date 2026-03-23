import urllib.request
import urllib.parse
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
    url = f"{BASE_URL}/auth/login"
    data = urllib.parse.urlencode({
        "username": username,
        "password": password
    }).encode('utf-8')
    
    req = urllib.request.Request(url, data=data, method='POST')
    req.add_header('Content-Type', 'application/x-www-form-urlencoded')
    
    try:
        with urllib.request.urlopen(req) as response:
            status_code = response.getcode()
            print(f"Status Code: {status_code}")
            
            response_body = response.read().decode('utf-8')
            data = json.loads(response_body)
            
            token = data.get("access_token")
            print("Login Successful!")
            
            payload = decode_jwt_payload(token)
            role = payload.get("role")
            print(f"Role in Token: '{role}'")
            
    except urllib.request.HTTPError as e:
        print(f"Login Failed: {e.code} - {e.read().decode('utf-8')}")
    except Exception as e:
        print(f"Request Error: {e}")

def register_user(username, password):
    print(f"\nAttempting REGISTRATION for {username}...")
    url = f"{BASE_URL}/auth/register"
    data = json.dumps({
        "username": username,
        "password": password,
        "role": "Employee" # API expects Title Case usually? Or whatever matches Enum input
    }).encode('utf-8')
    
    req = urllib.request.Request(url, data=data, method='POST')
    req.add_header('Content-Type', 'application/json')
    
    try:
        with urllib.request.urlopen(req) as response:
            print(f"Registration Status: {response.getcode()}")
            print("Registration Successful!")
    except urllib.request.HTTPError as e:
        print(f"Registration Failed: {e.code} - {e.read().decode('utf-8')}")


if __name__ == "__main__":
    # Register first
    register_user("TestKeerthi", "password123")
    # Then Login
    test_login("TestKeerthi", "password123")
