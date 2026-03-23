import urllib.request
import urllib.parse
import json

BASE_URL = "http://localhost:8000"

def get_token(username, password):
    url = f"{BASE_URL}/auth/login"
    data = urllib.parse.urlencode({
        "username": username,
        "password": password
    }).encode('utf-8')
    
    req = urllib.request.Request(url, data=data, method='POST')
    req.add_header('Content-Type', 'application/x-www-form-urlencoded')
    
    with urllib.request.urlopen(req) as response:
        if response.getcode() == 200:
            data = json.loads(response.read().decode('utf-8'))
            return data['access_token']
    return None

def test_get_users():
    token = get_token("admin", "admin123")
    if not token:
        print("Failed to login as admin")
        return

    print("Logged in as admin. Fetching users...")
    url = f"{BASE_URL}/admin/users"
    req = urllib.request.Request(url, method='GET')
    req.add_header('Authorization', f'Bearer {token}')
    
    try:
        with urllib.request.urlopen(req) as response:
            print(f"Status Code: {response.getcode()}")
            data = json.loads(response.read().decode('utf-8'))
            print("Users found:", len(data))
            for u in data:
                print(f" - {u['username']} ({u['role']})")
                
    except urllib.request.HTTPError as e:
        print(f"API Error: {e.code}")
        print(e.read().decode('utf-8'))
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_get_users()
