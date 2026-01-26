# Imports
import osmnx as ox
import pandas as pd
import time

# Parameters
PLACE_NAME = "London, UK"
TAGS = {'amenity': ['bar', 'pub', 'biergarten', 'nightclub']}
OUTPUT_FILENAME = f"{''.join(c for c in PLACE_NAME.split()[0] if c.isalpha()).lower()}_data.csv"

print(f"Configuration loaded - Processing place: {PLACE_NAME}")
print(f"Filtering OpenStreetMap data for amenity types: {TAGS}\n")

def main():
    # Data Acquisition
    print("Acquiring data from OpenStreetMap (API)...")
    start_time = time.time()
    gdf = ox.features_from_place(PLACE_NAME, TAGS)
    end_time = time.time()
    print(f"Data acquisition took {end_time - start_time:.2f} seconds.\n")

    # Geometry Processing
    if not gdf.empty:
        print("Processing geometries (converting to centroids)...")
        # Project to UTM -> Centroid -> Back to WGS84
        gdf_projected = gdf.to_crs(gdf.estimate_utm_crs())
        gdf_projected['geometry'] = gdf_projected.geometry.centroid
        gdf = gdf_projected.to_crs(epsg=4326)

        # Data Extraction
        print("Extracting latitude and longitude coordinates...")
        gdf['latitude'] = gdf.geometry.y
        gdf['longitude'] = gdf.geometry.x

        # Column Selection
        print("Selecting relevant columns...\n")
        cols = ["name", "amenity", "latitude", "longitude"]
        # Ensure columns exist before selection to avoid errors
        existing_cols = [c for c in cols if c in gdf.columns]
        final_df = gdf[existing_cols]

        # Output & Export
        print(f"Found {len(gdf)} locations in {PLACE_NAME}.")
        print(final_df.head())
        final_df.to_csv(OUTPUT_FILENAME, index=False)
        print(f"\nSaved results to: {OUTPUT_FILENAME}")

    else:
        print("No locations found using the specified filter.")


if __name__ == "__main__":
    main()