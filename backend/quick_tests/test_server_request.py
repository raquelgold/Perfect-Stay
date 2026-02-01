from backend.server import app
import json

def test_server():
    print("--- TESTING FLASK ENDPOINT ---")
    client = app.test_client()
    
    # Test Paris
    payload_paris = {
        "location": "Paris",
        "goals": ["Nightlife", "Shopping"]
    }
    print(f"Sending POST /recommend with {payload_paris}")
    response = client.post('/recommend', json=payload_paris)
    print(f"Status: {response.status_code}")
    data = response.get_json()
    if isinstance(data, list):
        print(f"Response: List with length {len(data)}")
        if len(data) > 0:
            print("First item:", data[0].get('title', 'No Title'))
    else:
        print("Response:", data)

    print("\n")
    
    # Test London
    payload_london = {
        "location": "London",
        "goals": ["Nature"]
    }
    print(f"Sending POST /recommend with {payload_london}")
    response = client.post('/recommend', json=payload_london)
    print(f"Status: {response.status_code}")
    data = response.get_json()
    if isinstance(data, list):
        print(f"Response: List with length {len(data)}")
        if len(data) > 0:
            print("First item:", data[0].get('title', 'No Title'))
    else:
        print("Response:", data)

if __name__ == "__main__":
    test_server()
