# Databricks notebook source
# MAGIC %md
# MAGIC # Installations

# COMMAND ----------

# MAGIC %pip install "numpy<2.0.0" pyrosm

# COMMAND ----------

dbutils.library.restartPython()

# COMMAND ----------

# MAGIC %md
# MAGIC # Imports & Configuration

# COMMAND ----------

# Imports
from pyrosm import OSM
import pandas as pd
import time
import os

# Parameters
REGION_NAME = "Cyprus"
INPUT_FILE_PATH = "/dbfs/FileStore/tables/cyprus_latest_osm.pbf"
OUTPUT_TABLE_NAME = f"{REGION_NAME.lower()}_data_delta"
TAGS = {'amenity': ['bar', 'pub', 'biergarten', 'nightclub']}

print(f"Configuration loaded - Processing region: {REGION_NAME}")
print(f"Reading from: {INPUT_FILE_PATH}")
print(f"Output Delta table: {OUTPUT_TABLE_NAME}")
print(f"Filtering OpenStreetMap data for amenity types: {TAGS}\n")

# COMMAND ----------

# MAGIC %md
# MAGIC # Data Processing

# COMMAND ----------

# Data Acquisition
if os.path.exists(INPUT_FILE_PATH):
    print("Acquiring data from PBF source...")
    osm = OSM(INPUT_FILE_PATH)
    print(f"Data source loaded: {INPUT_FILE_PATH}\n")

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

        # Selecting relevant columns
        print("Selecting relevant columns...\n")
        cols = ["name", "amenity", "latitude", "longitude"]
        # Ensure columns exist before selection to avoid errors
        existing_cols = [c for c in cols if c in gdf.columns]
        pdf = gdf[existing_cols]

        # Output / Export preview
        print(f"Found {len(pdf)} locations in {REGION_NAME}.")
        print(pdf.head())

    else:
        print("No locations found using the specified filter.")
        pdf = pd.DataFrame()

else:
    raise FileNotFoundError(f"File not found at: {INPUT_FILE_PATH}")

# COMMAND ----------

# MAGIC %md
# MAGIC # Save to Delta

# COMMAND ----------

# Output / Export to Delta Table
if 'pdf' in locals() and not pdf.empty:
    print("Converting Pandas DataFrame to Spark DataFrame...")
    
    # Create Spark DataFrame
    spark_df = spark.createDataFrame(pdf)
    
    # Save to Delta
    print(f"Saving results to Delta table: {OUTPUT_TABLE_NAME}...")
    spark_df.write.format("delta").mode("overwrite").saveAsTable(OUTPUT_TABLE_NAME)
    print(f"Saved results to table: {OUTPUT_TABLE_NAME}")
    
    # Display result
    display(spark.table(OUTPUT_TABLE_NAME))

else:
    print("Nothing to save (DataFrame is empty).")