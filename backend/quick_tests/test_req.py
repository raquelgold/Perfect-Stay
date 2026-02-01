import requests
import json

def test_endpoint():
    url = "http://localhost:5000/recommend"
    payload = {
        "location": "Paris",
        "goals": ["Nightlife", "Shopping"]
    }
    
    print(f"Sending POST to {url} with {payload}")
    try:
        response = requests.post(url, json=payload)
        print(f"Status: {response.status_code}")
        data = response.json()
        
        if isinstance(data, list):
            print(f"Response List Length: {len(data)}")
            if len(data) > 0:
                print("First item keys:", data[0].keys())
                print("First item source:", data[0].get('source'))
                print("First item title:", data[0].get('title', 'Unknown'))
        else:
            print("Response:", data)
            
    except Exception as e:
        print(f"Request Error: {e}")

if __name__ == "__main__":
    test_endpoint()
