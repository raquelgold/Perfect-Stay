import requests
import json

try:
    response = requests.get('http://localhost:5000/matches')
    if response.status_code == 200:
        matches = response.json()
        print(f"Success! Found {len(matches)} matches.")
        if matches:
            print("First match:", json.dumps(matches[0], indent=2))
        else:
            print("Matches list is empty.")
    else:
        print(f"Failed: {response.status_code} - {response.text}")
except Exception as e:
    print(f"Connection failed: {e}")
