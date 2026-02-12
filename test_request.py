import requests

# Test login
login_response = requests.post(
    'http://localhost:8000/auth/login',
    data={'username': 'hai', 'password': 'hai'},
    headers={'Content-Type': 'application/x-www-form-urlencoded'}
)
print("Login Status:", login_response.status_code)
print("Login Response:", login_response.json())

if login_response.status_code == 200:
    token = login_response.json()['access_token']
    
    # Test request submission
    request_response = requests.post(
        'http://localhost:8000/requests',
        json={'title': 'Test Request', 'description': 'Testing submission'},
        headers={'Authorization': f'Bearer {token}'}
    )
    print("\nRequest Status:", request_response.status_code)
    print("Request Response:", request_response.text)
