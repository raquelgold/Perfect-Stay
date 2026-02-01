from backend.server import get_coordinates

def test_geo():
    print("Testing Geoapify...")
    
    cities = ["Paris", "London", "New York", "UnknownCity12345"]
    
    for city in cities:
        print(f"Lookup '{city}'...")
        try:
            lat, lon = get_coordinates(city)
            print(f"Result: {lat}, {lon}")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    test_geo()
