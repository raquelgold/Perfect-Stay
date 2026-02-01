from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import requests
import numpy as np

import os

app = Flask(__name__)
CORS(app)

# --- CONFIGURATION ---
GEOAPIFY_KEY = "66ab991719644b2b8434458898eecf96"  # Your API Key

# Build absolute paths relative to this script's location
# Build absolute paths relative to this script's location
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
AIRBNB_FILE = os.path.join(BASE_DIR, 'data', 'airbnb_demo_data.csv')
BOOKING_FILE = os.path.join(BASE_DIR, 'data', 'booking_demo_data.csv')
AIRBNB_WC_FILE = os.path.join(BASE_DIR, 'data', 'airbnb_worldcup_demo_data.csv')
BOOKING_WC_FILE = os.path.join(BASE_DIR, 'data', 'booking_worldcup_demo_data.csv')

# LOAD DATA ON STARTUP
print("Loading CSV data...")

def load_dataset(filepath, source_name, is_booking=False):
    print(f"Loading {filepath}...")
    try:
        df = pd.read_csv(filepath)
        df.columns = df.columns.str.strip()
        
        # Rename logic
        if is_booking:
            rename_map = {'relaxation_score': 'wellness_score', 'images': 'images'} # Ensure images is kept/renamed if needed
            df = df.rename(columns=rename_map)
            if 'title' not in df.columns:
                df['title'] = "Unknown Property"
            else:
                df['title'] = df['title'].fillna("Unknown Property")
        else:
            rename_map = {'latitude': 'lat', 'longitude': 'long', 'name': 'title'}
            df = df.rename(columns=rename_map)
            
        df['source'] = source_name
        
        # Coerce lat/long
        if 'lat' in df.columns and 'long' in df.columns:
            df['lat'] = pd.to_numeric(df['lat'], errors='coerce')
            df['long'] = pd.to_numeric(df['long'], errors='coerce')
            df.dropna(subset=['lat', 'long'], inplace=True)
        else:
             print(f"WARNING: {source_name} missing lat/long columns")

        # Score columns
        score_cols = ["nightlife_score", "nature_score", "tourist_score", "shopping_score", "wellness_score"]
        for col in score_cols:
            if col not in df.columns:
                df[col] = 0.0
            else:
                df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
                
        return df
    except Exception as e:
        print(f"Error loading {source_name}: {e}")
        return pd.DataFrame()

def load_and_clean_data():
    try:
        df_a = load_dataset(AIRBNB_FILE, 'airbnb', is_booking=False)
        df_b = load_dataset(BOOKING_FILE, 'booking', is_booking=True)
        df_a_wc = load_dataset(AIRBNB_WC_FILE, 'airbnb', is_booking=False)
        df_b_wc = load_dataset(BOOKING_WC_FILE, 'booking', is_booking=True)

        print(f"Data Loaded. Airbnb: {len(df_a)}, Booking: {len(df_b)}")
        print(f"WC Data Loaded. Airbnb: {len(df_a_wc)}, Booking: {len(df_b_wc)}")
        return df_a, df_b, df_a_wc, df_b_wc

    except Exception as e:
        print(f"ERROR Loading Data: {e}")
        return pd.DataFrame(), pd.DataFrame(), pd.DataFrame(), pd.DataFrame()

df_airbnb, df_booking, df_airbnb_wc, df_booking_wc = load_and_clean_data()

def get_coordinates(city_name):
    """Asks Geoapify for the lat/lon of a city name"""
    url = f"https://api.geoapify.com/v1/geocode/search?text={city_name}&apiKey={GEOAPIFY_KEY}"
    
    try:
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            if data['features']:
                # Extract lat/lon from the first result found
                lat = data['features'][0]['properties']['lat']
                lon = data['features'][0]['properties']['lon']
                return lat, lon
    except Exception as e:
        print(f"Geoapify Error: {e}")
    
    return None, None

def get_recommendations_for_data(df, target_lat, target_lon, user_goals):
    """Filters a dataframe by location and scores it by goals."""
    if df.empty:
        print("DEBUG: Source dataframe is empty")
        return pd.DataFrame()

    # 1. FILTERING (Approx +/- 15km box)
    lat_min, lat_max = target_lat - 0.15, target_lat + 0.15
    lon_min, lon_max = target_lon - 0.15, target_lon + 0.15

    nearby_df = df[
        (df['lat'] >= lat_min) & (df['lat'] <= lat_max) &
        (df['long'] >= lon_min) & (df['long'] <= lon_max)
    ].copy()

    print(f"DEBUG: Found {len(nearby_df)} nearby properties in {df['source'].iloc[0] if not df.empty else 'unknown'}")

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
    
    return results

# 1. LOAD MATCHES DATA
MATCHES_FILE = os.path.join(BASE_DIR, 'data', 'download_demo_data.csv')
print(f"Loading {MATCHES_FILE}...")

try:
    df_matches = pd.read_csv(MATCHES_FILE)
    # Rename columns to match frontend interface
    # Note: CSV headers seem swapped/misleading based on content inspection
    # group_or_stage column contains "Team A vs Team B" -> match_name
    # match_teams column contains "Group H" -> group
    df_matches = df_matches.rename(columns={
        'group_or_stage': 'match_name',
        'match_teams': 'group',
        'latitude': 'lat',
        'longitude': 'long'
    })
    # Add an ID column
    df_matches['id'] = range(1, len(df_matches) + 1)
    
    # Ensure numeric coords
    df_matches['lat'] = pd.to_numeric(df_matches['lat'], errors='coerce')
    df_matches['long'] = pd.to_numeric(df_matches['long'], errors='coerce')
    
    # Fill defaults
    df_matches = df_matches.fillna('')
    print(f"Loaded {len(df_matches)} World Cup matches.")

except Exception as e:
    print(f"ERROR Loading Matches: {e}")
    df_matches = pd.DataFrame()

@app.route('/matches', methods=['GET'])
def get_matches():
    try:
        if df_matches.empty:
            return jsonify([])
        
        return jsonify(df_matches.to_dict(orient='records'))
    except Exception as e:
        print(f"Server Error (Matches): {e}")
        return jsonify({"error": "Internal Server Error"}), 500

def get_closest_properties(df, target_lat=None, target_lon=None, target_city=None):
    """Sorts dataframe by distance to target location. 
    Preferentially uses pre-calculated distance_to_stadium if available and city matches."""
    if df.empty:
        return pd.DataFrame()

    result_df = df.copy()

    # Strategy 1: Use pre-calculated distance_to_stadium if city is provided and column exists
    if target_city and 'nearest_stadium_city' in result_df.columns and 'distance_to_stadium' in result_df.columns:
        # Filter by city (case-insensitive check)
        city_mask = result_df['nearest_stadium_city'].astype(str).str.lower() == target_city.lower()
        city_matches = result_df[city_mask]
        
        if not city_matches.empty:
            print(f"DEBUG: Found {len(city_matches)} properties for city '{target_city}' using pre-calc distance.")
            return city_matches.sort_values('distance_to_stadium').head(4)
        else:
            print(f"DEBUG: No properties found for city '{target_city}', falling back to coordinates.")

    # Strategy 2: Calculate distance to lat/lon if provided
    if target_lat is not None and target_lon is not None:
         # Calculate squared Euclidean distance (faster, sufficient for sorting)
        # (lat - t_lat)^2 + (long - t_long)^2
        dist_sq = (result_df['lat'] - target_lat)**2 + (result_df['long'] - target_lon)**2
        result_df['distance_sq'] = dist_sq
        return result_df.sort_values('distance_sq').head(4)
    
    return pd.DataFrame()

@app.route('/recommend', methods=['POST'])
def recommend():
    try:
        data = request.json
        user_location = data.get('location', '')
        user_goals = data.get('goals', ['Nightlife'])
        req_lat = data.get('lat') # Optional: direct lat provided
        req_long = data.get('long') # Optional: direct long provided
        
        if isinstance(user_goals, str):
            user_goals = [user_goals]

        print(f"User Request: '{user_location}' for goals: {user_goals}")

        target_lat, target_lon = None, None

        # Determine if World Cup search
        is_world_cup = "FIFA World Cup 2026" in user_goals
        
        # Select datasets
        target_df_airbnb = df_airbnb_wc if is_world_cup else df_airbnb
        target_df_booking = df_booking_wc if is_world_cup else df_booking
        
        if is_world_cup:
             print("DEBUG: Using World Cup Datasets")

        # Resolve Coordinates
        if req_lat is not None and req_long is not None:
             target_lat, target_lon = float(req_lat), float(req_long)
             print(f"DEBUG: Using provided coordinates: {target_lat}, {target_lon}")
        else:
             target_lat, target_lon = get_coordinates(user_location)
        
        if target_lat is None:
            return jsonify({"error": "Could not find that location."}), 404

        # Get Candidates
        if is_world_cup:
            # For World Cup, try to use city/distance column first, then coords
            top_airbnb = get_closest_properties(target_df_airbnb, target_lat, target_lon, user_location)
            top_booking = get_closest_properties(target_df_booking, target_lat, target_lon, user_location)
            print(f"DEBUG: Found {len(top_airbnb)} closest Airbnb and {len(top_booking)} closest Booking properties")
        else:
            # Normal logic: filter by bounding box then score by goal
            top_airbnb = get_recommendations_for_data(target_df_airbnb, target_lat, target_lon, user_goals).head(4)
            top_booking = get_recommendations_for_data(target_df_booking, target_lat, target_lon, user_goals).head(4)

        # Merge
        # Check if empty
        r1 = top_airbnb if not top_airbnb.empty else pd.DataFrame()
        r2 = top_booking if not top_booking.empty else pd.DataFrame()
        
        combined = pd.concat([r1, r2], ignore_index=True)

        if combined.empty:
            return jsonify([])

        # Convert NaN values to None for JSON safety
        combined = combined.astype(object).where(pd.notnull(combined), None)
        
        # Ensure source is included if missing (should be there from load)
        results = combined.to_dict(orient='records')
        return jsonify(results)

    except Exception as e:
        print(f"Server Error: {e}")
        return jsonify({"error": "Internal Server Error"}), 500

if __name__ == '__main__':
    print("Backend running on port 5000...")
    app.run(port=5000)