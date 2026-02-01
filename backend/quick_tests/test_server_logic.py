import sys
import os
import pandas as pd

# Add backend to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    import server
    print("Successfully imported server module")
except ImportError as e:
    print(f"Failed to import server: {e}")
    sys.exit(1)

def test_booking_logic():
    print("\n--- Testing Booking Logic ---")
    
    # Access the loaded dataframes
    if server.df_booking.empty:
        print("FAIL: df_booking is empty after import")
    else:
        print(f"SUCCESS: df_booking loaded with {len(server.df_booking)} rows")
        print(f"Columns: {server.df_booking.columns.tolist()}")
    
    # Test London Coordinates
    target_lat = 51.5074
    target_lon = -0.1278
    user_goals = ['Nightlife']
    
    print(f"\nScanning for {user_goals} around {target_lat}, {target_lon}")
    
    results = server.get_recommendations_for_data(server.df_booking, target_lat, target_lon, user_goals)
    
    if results.empty:
        print("FAIL: No results returned for Booking data")
    else:
        print(f"SUCCESS: Found {len(results)} results")
        print("Top 5 Results:")
        print(results[['title', 'lat', 'long', 'final_score']].head())

if __name__ == "__main__":
    test_booking_logic()
