# Imports
from pyrosm import OSM, get_data
import pandas as pd
import time
import os

# Parameters
REGION_NAME = "Cyprus"
DOWNLOAD_DIR = f"osm_data_{REGION_NAME.lower()}"
OUTPUT_FILENAME = f"{REGION_NAME.lower()}_data.csv"
TAGS = {'amenity': ['bar', 'pub', 'biergarten', 'nightclub']}

print(f"Configuration loaded - Processing region: {REGION_NAME}")
print(f"Local download directory set to: {DOWNLOAD_DIR}")
print(f"Output CSV file will be saved as: {OUTPUT_FILENAME}")
print(f"Filtering OpenStreetMap data for amenity types: {TAGS}\n")

def main():
    # Setup Directory (Specific to PBF method)
    if not os.path.exists(DOWNLOAD_DIR):
        os.makedirs(DOWNLOAD_DIR)
        print(f"Created directory: {DOWNLOAD_DIR}\n")

    # Data Acquisition
    print("Acquiring data from PBF source...")
    fp = get_data(REGION_NAME, directory=DOWNLOAD_DIR)
    osm = OSM(fp)
    print(f"Data source loaded: {fp}")

    print("Parsing data...")
    start_time = time.time()
    gdf = osm.get_pois(custom_filter=TAGS)
    end_time = time.time()
    print(f"Data parsing took {end_time - start_time:.2f} seconds.\n")

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
        print(f"Found {len(gdf)} locations in {REGION_NAME}.")
        print(final_df.head())
        final_df.to_csv(OUTPUT_FILENAME, index=False)
        print(f"\nSaved results to: {OUTPUT_FILENAME}")

    else:
        print("No locations found using the specified filter.")


if __name__ == "__main__":
    main()