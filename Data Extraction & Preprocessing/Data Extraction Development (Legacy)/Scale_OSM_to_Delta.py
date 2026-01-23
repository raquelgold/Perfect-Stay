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
import pandas as pd
from pyrosm import OSM, get_data
from pyspark.sql.functions import pandas_udf, col
from pyspark.sql.types import StructType, StructField, StringType, DoubleType
import os

# Parameters
REGIONS_LIST = ["Andorra", "Liechtenstein", "Malta", "Monaco", "Cyprus", "Luxembourg"]
OUTPUT_TABLE_NAME = "world_data_distributed"
TAGS = {'amenity': ['bar', 'pub', 'biergarten', 'nightclub']}

# Schema Configuration
result_schema = StructType([
    StructField("name", StringType(), True),
    StructField("amenity", StringType(), True),
    StructField("latitude", DoubleType(), True),
    StructField("longitude", DoubleType(), True),
    StructField("source_region", StringType(), True)
])

print(f"Configuration loaded.")
print(f"Processing regions: {REGIONS_LIST}")
print(f"Filtering OpenStreetMap data for amenity types: {TAGS}")
print(f"Output Delta table: {OUTPUT_TABLE_NAME}")

# COMMAND ----------

# MAGIC %md
# MAGIC # Data Processing Logic

# COMMAND ----------

# Processing Function (Runs on Workers)
def process_region_batch(pdf_chunk):
    """
    Receives a list of regions (pandas DataFrame) and processes them.
    This function runs in parallel on the cluster workers.
    """
    all_results = []
    
    # Local download directory on the worker node
    worker_download_dir = "/tmp/osm_data_worker"
    if not os.path.exists(worker_download_dir):
        os.makedirs(worker_download_dir)

    # Iterate over regions assigned to this worker
    for region_name in pdf_chunk['region_name']:
        try:
            # Data Acquisition
            # Using get_data within worker to ensure local file access
            fp = get_data(region_name, directory=worker_download_dir)
            osm = OSM(fp)
            
            # Parsing data
            # Using the same filter as local version
            gdf = osm.get_pois(custom_filter=TAGS)
            
            # Geometry Processing
            if not gdf.empty:
                # Project to UTM -> Centroid -> Back to WGS84
                gdf_projected = gdf.to_crs(gdf.estimate_utm_crs())
                gdf_projected['geometry'] = gdf_projected.geometry.centroid
                gdf = gdf_projected.to_crs(epsg=4326)

                # Data Extraction
                gdf['latitude'] = gdf.geometry.y
                gdf['longitude'] = gdf.geometry.x
                
                # Add source metadata
                gdf['source_region'] = region_name

                # Column Selection
                cols = ["name", "amenity", "latitude", "longitude", "source_region"]
                # Ensure columns exist before selection to avoid errors
                existing_cols = [c for c in cols if c in gdf.columns]
                
                # Append to results list
                all_results.append(gdf[existing_cols])
                
        except Exception as e:
            print(f"Error processing {region_name}: {str(e)}")
            continue

    # Return combined results for this batch
    if all_results:
        return pd.concat(all_results)
    else:
        # Return empty structure matching schema if nothing found
        return pd.DataFrame(columns=["name", "amenity", "latitude", "longitude", "source_region"])

print("Processing function defined.")

# COMMAND ----------

# MAGIC %md
# MAGIC # Execution and Save to Delta

# COMMAND ----------

# Execution & Save
print("Distributing tasks across the cluster...")

# Create a DataFrame of regions to trigger the parallel process
regions_df = spark.createDataFrame([(r,) for r in REGIONS_LIST], ["region_name"])

# Apply the processing function in parallel
# repartition ensures we utilize all available workers
final_spark_df = regions_df \
    .repartition(len(REGIONS_LIST)) \
    .groupby("region_name") \
    .applyInPandas(process_region_batch, schema=result_schema)

# Save to Delta
print(f"Saving results to Delta table: {OUTPUT_TABLE_NAME}...")
final_spark_df.write.format("delta").mode("overwrite").saveAsTable(OUTPUT_TABLE_NAME)

print(f"\nSaved results to table: {OUTPUT_TABLE_NAME}")

# Display result
display(spark.table(OUTPUT_TABLE_NAME).limit(5))

# COMMAND ----------

# MAGIC %md
# MAGIC # Read Data from Delta Table

# COMMAND ----------

# Data Retrieval
print(f"Configuration loaded - Target table: {OUTPUT_TABLE_NAME}\n")
print(f"Reading data from Delta table...")
try:
    # Load data directly from the Delta table (zero network download)
    df = spark.table(OUTPUT_TABLE_NAME)
    
    # Output / Display
    count = df.count()
    print(f"Successfully loaded {count} records from database.")
    
    print("Displaying sample data:")
    display(df.limit(5))

except Exception as e:
    print(f"Error reading table: {e}")
    print("Please verify the table name in the Catalog.")