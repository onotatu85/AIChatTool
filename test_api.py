import requests
import json

url = "http://127.0.0.1:8000/api/issues/"
headers = {"Content-Type": "application/json"}
payload = {
    "title": "Test Issue",
    "description": "This is a test issue detail.",
    "resolution": "Test resolution",
    "tags": "test,debug"
}

try:
    response = requests.post(url, headers=headers, json=payload)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
