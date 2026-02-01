import pandas as pd
import os
import numpy as np

# Mock implementation from server.py to test logic

def get_recommendations_for_data(df, target_lat, target_lon, user_goals):
    """Filters a dataframe by location and scores it by goals."""
    if df.empty:
        print("DF is empty!")
        return pd.DataFrame()

    print(f"DEBUG: Filtering {len(df)} records around {target_lat}, {target_lon}")

    # 1. FILTERING (Approx +/- 15km box)
    lat_min, lat_max = target_lat - 0.15, target_lat + 0.15
    lon_min, lon_max = target_lon - 0.15, target_lon + 0.15

    # Check data types
    print("Lat dtype:", df['lat'].dtype)
    print("Long dtype:", df['long'].dtype)

    nearby_df = df[
        (df['lat'] >= lat_min) & (df['lat'] <= lat_max) &
        (df['long'] >= lon_min) & (df['long'] <= lon_max)
    ].copy()

    print(f"DEBUG: Found {len(nearby_df)} nearby properties")

    if nearby_df.empty:
        return pd.DataFrame()

    # 2. SCORING
    column_map = {
        "Nightlife": "nightlife_score",
        "Nature": "nature_score",
        "Tourist Attractions": "tourist_score",
        "Shopping": "shopping_score",
        "Wellness": "wellness_score" 
    }

    valid_score_columns = []
    for goal in user_goals:
        col_name = column_map.get(goal)
        if col_name and col_name in nearby_df.columns:
            valid_score_columns.append(col_name)

    if valid_score_columns:
        nearby_df['final_score'] = nearby_df[valid_score_columns].sum(axis=1)
        results = nearby_df.sort_values(by='final_score', ascending=False)
    else:
        results = nearby_df
    
    print(f"DEBUG: Returning {len(results)} results")
    return results

def test():
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    BOOKING_FILE = os.path.join(BASE_DIR, 'data', 'booking_demo_data.csv')
    
    print(f"Loading {BOOKING_FILE}...")
    try:
        df_booking = pd.read_csv(BOOKING_FILE)
        df_booking.columns = df_booking.columns.str.strip() # Strip whitespace from headers
    except Exception as e:
        print(f"Failed to read CSV: {e}")
        return

    # Check columns
    print("Columns:", df_booking.columns.tolist())

    # Rename for consistency (Booking treats "relaxation" as "wellness")
    rename_map_booking = {
        'relaxation_score': 'wellness_score'
    }
    df_booking = df_booking.rename(columns=rename_map_booking)
    
    # Check if 'source' column exists or needs adding
    df_booking['source'] = 'booking'

    # ENSURE NUMERIC SCORES
    score_cols = ["nightlife_score", "nature_score", "tourist_score", "shopping_score", "wellness_score"]
    
    for col in score_cols:
        if col not in df_booking.columns:
            df_booking[col] = 0.0 # Default missing features to 0
        else:
            df_booking[col] = pd.to_numeric(df_booking[col], errors='coerce').fillna(0)

    # Test Location: London (approx)
    target_lat = 51.5074
    target_lon = -0.1278
    user_goals = ['Nightlife']

    print("\n--- Testing Booking Data ---")
    results = get_recommendations_for_data(df_booking, target_lat, target_lon, user_goals)
    
    if not results.empty:
        print("Top 5 results:")
        print(results[['title', 'lat', 'long', 'final_score']].head())
    else:
        print("No results found.")

if __name__ == "__main__":
    test()
