import os

def verify_paths():
    # Simulate the logic in server.py (assuming this script is in same dir as server.py)
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    AIRBNB_FILE = os.path.join(BASE_DIR, 'data', 'airbnb_demo_data.csv')
    BOOKING_FILE = os.path.join(BASE_DIR, 'data', 'booking_demo_data.csv')
    
    print(f"Base Dir: {BASE_DIR}")
    print(f"Airbnb Path: {AIRBNB_FILE}")
    print(f"Exists: {os.path.exists(AIRBNB_FILE)}")
    
    print(f"Booking Path: {BOOKING_FILE}")
    print(f"Exists: {os.path.exists(BOOKING_FILE)}")

if __name__ == "__main__":
    verify_paths()
