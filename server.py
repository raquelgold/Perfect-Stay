from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import requests
import numpy as np

app = Flask(__name__)
CORS(app)

# --- CONFIGURATION ---
GEOAPIFY_KEY = "66ab991719644b2b8434458898eecf96"  # Your API Key
DATA_FILE = 'airbnb_demo.csv'  # Ensure this matches your downloaded file name

# 1. LOAD DATA ON STARTUP
print("Loading CSV data...")
try:
    df = pd.read_csv(DATA_FILE)
    # Clean column names (remove extra spaces just in case)
    df.columns = df.columns.str.strip()
    
    # Ensure score columns are numeric (handles potential bad data/text in columns)
    score_cols = ["nightlife_score", "nature_score", "tourist_score", "shopping_score", "wellness_score"]
    for col in score_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
            
    print(f"Data Loaded: {len(df)} records.")
except Exception as e:
    print(f"ERROR: Could not find {DATA_FILE}. Make sure it is in the backend folder.")
    df = pd.DataFrame() # Create empty dataframe to prevent crash

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

@app.route('/recommend', methods=['POST'])
def recommend():
    try:
        data = request.json
        user_location = data.get('location', '')
        
        # Expect a LIST of goals. Default to ['Nightlife'] if empty.
        user_goals = data.get('goals', ['Nightlife']) 
        
        # Guard clause: If frontend sends a single string, convert to list
        if isinstance(user_goals, str):
            user_goals = [user_goals]

        print(f"User Request: '{user_location}' for goals: {user_goals}")

        # 1. GEOCODING
        target_lat, target_lon = get_coordinates(user_location)
        if target_lat is None:
            return jsonify({"error": "Could not find that location."}), 404

        # 2. FILTERING (Approx +/- 15km box)
        lat_min, lat_max = target_lat - 0.15, target_lat + 0.15
        lon_min, lon_max = target_lon - 0.15, target_lon + 0.15

        nearby_df = df[
            (df['lat'] >= lat_min) & (df['lat'] <= lat_max) &
            (df['long'] >= lon_min) & (df['long'] <= lon_max)
        ].copy()

        if nearby_df.empty:
            return jsonify([])

        # 3. MULTI-GOAL SCORING
        column_map = {
            "Nightlife": "nightlife_score",
            "Nature": "nature_score",
            "Tourist Attractions": "tourist_score",
            "Shopping": "shopping_score",
            "Wellness": "wellness_score"
        }

        # Find which CSV columns match the user's chosen goals
        valid_score_columns = []
        for goal in user_goals:
            col_name = column_map.get(goal)
            if col_name and col_name in nearby_df.columns:
                valid_score_columns.append(col_name)

        # Calculate the "Combined Score"
        if valid_score_columns:
            # Sum the scores of all selected categories
            nearby_df['final_score'] = nearby_df[valid_score_columns].sum(axis=1)
            # Sort High to Low
            top_5 = nearby_df.sort_values(by='final_score', ascending=False).head(5)
        else:
            # Fallback if no valid goals found
            top_5 = nearby_df.head(5)

        # --- THE JSON FIX ---
        # Convert NaN values (which break JSON) to None (which becomes JSON null)
        top_5 = top_5.astype(object).where(pd.notnull(top_5), None)
        
        # Convert to dictionary for JSON response
        results = top_5.to_dict(orient='records')
        
        return jsonify(results)

    except Exception as e:
        print(f"Server Error: {e}")
        return jsonify({"error": "Internal Server Error"}), 500

if __name__ == '__main__':
    print("Backend running on port 5000...")
    app.run(port=5000)