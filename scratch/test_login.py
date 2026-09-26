import urllib.request
import json
import urllib.error

url = "http://127.0.0.1:8000/api/v1/auth/login"
data = json.dumps({"email": "test@test.com", "password": "test"}).encode("utf-8")
headers = {"Content-Type": "application/json"}
req = urllib.request.Request(url, data=data, headers=headers, method="POST")

try:
    with urllib.request.urlopen(req) as response:
        print("Status:", response.status)
        print("Response:", response.read().decode("utf-8"))
except urllib.error.HTTPError as e:
    print("HTTP Error Status:", e.code)
    print("HTTP Error Response:", e.read().decode("utf-8"))
except Exception as e:
    print("Error:", e)
