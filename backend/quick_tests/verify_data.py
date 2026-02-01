import pandas as pd
import numpy as np

AIRBNB_FILE = 'backend/data/airbnb_demo_data.csv'
BOOKING_FILE = 'backend/data/booking_demo_data.csv'

def check_data():
    print("--- CHECKING AIRBNB DATA ---")
    try:
        df_airbnb = pd.read_csv(AIRBNB_FILE)
        df_airbnb.columns = df_airbnb.columns.str.strip()
        print("Columns:", df_airbnb.columns.tolist())
        print("Lat dtype:", df_airbnb['lat'].dtype)
        print("Long dtype:", df_airbnb['long'].dtype)
        
        # Check first row values
        print("First row lat/long:", df_airbnb.iloc[0]['lat'], df_airbnb.iloc[0]['long'])
        
        # Test filtering for Paris (approx 48.85, 2.35)
        target_lat, target_lon = 48.85, 2.35
        lat_min, lat_max = target_lat - 0.15, target_lat + 0.15
        lon_min, lon_max = target_lon - 0.15, target_lon + 0.15
        
        filtered = df_airbnb[
            (df_airbnb['lat'] >= lat_min) & (df_airbnb['lat'] <= lat_max) &
            (df_airbnb['long'] >= lon_min) & (df_airbnb['long'] <= lon_max)
        ]
        print(f"Paris filter matches: {len(filtered)}")

    except Exception as e:
        print(f"Airbnb Error: {e}")

    print("\n--- CHECKING BOOKING DATA ---")
    try:
        df_booking = pd.read_csv(BOOKING_FILE)
        df_booking.columns = df_booking.columns.str.strip()
        print("Columns:", df_booking.columns.tolist())
        print("Lat dtype:", df_booking['lat'].dtype)
        print("Long dtype:", df_booking['long'].dtype)
        
        # Check first row values
        print("First row lat/long:", df_booking.iloc[0]['lat'], df_booking.iloc[0]['long'])

        # Test filtering for London (approx 51.50, -0.12)
        target_lat, target_lon = 51.50, -0.12
        lat_min, lat_max = target_lat - 0.15, target_lat + 0.15
        lon_min, lon_max = target_lon - 0.15, target_lon + 0.15
        
        filtered = df_booking[
            (df_booking['lat'] >= lat_min) & (df_booking['lat'] <= lat_max) &
            (df_booking['long'] >= lon_min) & (df_booking['long'] <= lon_max)
        ]
        print(f"London filter matches: {len(filtered)}")

    except Exception as e:
        print(f"Booking Error: {e}")

if __name__ == "__main__":
    check_data()
