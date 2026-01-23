# Databricks notebook source
# MAGIC %md
# MAGIC # Imports & Configuration

# COMMAND ----------

# MAGIC %pip install h3

# COMMAND ----------

# MAGIC %restart_python

# COMMAND ----------

# Imports
import h3
import pandas as pd
from functools import reduce
from pyspark.sql import DataFrame
from pyspark.sql.functions import pandas_udf, col, lit, explode, count, sum as spark_sum, row_number, coalesce
from pyspark.sql.types import MapType, StringType, IntegerType, StructType, StructField, DoubleType, ArrayType
from pyspark.sql import Window

# Project Constants
AIRBNB_TABLE_NAME = "Raquel_world_data_A"
OUTPUT_TABLE_NAME = "Hex_world_data"
CATEGORIES_CONFIG = {
    "nightlife": {
        "table": "Itav_world_nightlife",
        "resolution": 10,
        "k_ring": 5
    },
    "nature": {
        "table": "Itav_world_nature",
        "resolution": 6,
        "k_ring": 5
    },
    "tourist": {
        "table": "Itav_world_tourist",
        "resolution": 9,
        "k_ring": 4
    },
    "shopping": {
        "table": "Itav_world_shopping",
        "resolution": 10,
        "k_ring": 3
    },
    "relaxation": {
        "table": "Itav_world_relaxation",
        "resolution": 8,
        "k_ring": 3
    }
}
TARGET_RESOLUTION = 10

print(f"Configuration loaded.")
print(f"Target Output Resolution: {TARGET_RESOLUTION}")
print(f"Categories configured: {list(CATEGORIES_CONFIG.keys())}")

# COMMAND ----------

# MAGIC %md
# MAGIC # UDFs for H3 Indexing & Projection

# COMMAND ----------

# Define vectorized UDF to compute H3 hexagon index based on Latitude/Longitude
@pandas_udf(StringType())
def get_h3_vectorized(lat_series: pd.Series, lon_series: pd.Series, res_series: pd.Series) -> pd.Series:
    """
    Converts Latitude/Longitude to H3 Index.
    Returns a Series of H3 index strings.
    """
    resolution = int(res_series.iloc[0])
    return lat_series.combine(lon_series, lambda lat, lon: h3.latlng_to_cell(lat, lon, resolution))

# Define UDF for Neighbor Discovery
@pandas_udf(MapType(StringType(), IntegerType()))
def get_kring_map(h3_series: pd.Series, k_series: pd.Series) -> pd.Series:
    """
    For each H3 hexagon index in the input Series, returns a map of neighboring hexagon indices
    (including itself) to their distance (in hexagons) from the source cell, up to SMOOTHING_DISTANCE.
    Returns a map of {neighbor_h3: distance} for each cell.
    """
    k_dist = int(k_series.iloc[0])
    
    def get_rings(cell):
        if not cell: return {}
        
        results = {}
        previous_disk = set()
        
        try:
            # Iterate through rings from 0 to K
            for k in range(k_dist + 1):
                # Get all cells within radius k
                current_disk = h3.grid_disk(cell, k)
                
                # Identify the new outer ring (Set difference)
                ring = current_disk - previous_disk
                
                # Assign distance to these neighbors
                for neighbor in ring:
                    results[neighbor] = k
                
                previous_disk = current_disk
            return results
        except Exception:
            return {cell: 0}
            
    return h3_series.apply(get_rings)


# UDF for Resolution Projection between Different Resolutions
@pandas_udf(ArrayType(StringType()))
def project_to_target_res(h3_series: pd.Series) -> pd.Series:
    """
    If the computed hex is larger (e.g. Res 7) than target (Res 10), return list of all Res 10 children.
    Returns a list of H3 indices.
    """
    return h3_series.apply(lambda x: list(h3.cell_to_children(x, TARGET_RESOLUTION)) if x else [])


# Schema for Coordinate Output
coords_schema = StructType([
    StructField("latitude", DoubleType(), True),
    StructField("longitude", DoubleType(), True)
])

# UDF to convert H3 Index back to Lat/Lon
@pandas_udf(coords_schema)
def get_h3_centroid(h3_series: pd.Series) -> pd.DataFrame:
    """
    Converts H3 Index to Centroid Coordinates.
    Returns a DataFrame with columns ['latitude', 'longitude'] matching the output schema.
    """
    coords_list = h3_series.apply(h3.cell_to_latlng).tolist()
    return pd.DataFrame(coords_list, columns=['latitude', 'longitude'])

print("UDFs defined successfully.")


# COMMAND ----------

# MAGIC %md
# MAGIC # Batch Processing Loop

# COMMAND ----------

print("Starting batch processing for all categories...\n")

score_dfs = []       # List to hold the score dataframes for each category
city_votes_dfs = [] # List to hold location metadata votes from all categories

for category, config in CATEGORIES_CONFIG.items():

    table_name = config["table"]
    res = config["resolution"]
    k = config["k_ring"]
    print(f"Processing {category.upper()} (Source: {table_name}).")
    
    try:
        # Read Data
        df_raw = spark.table(table_name)
        
        # Metadata Voting (Collect city/country info for later analysis)
        df_meta_h3 = df_raw.withColumn("h3_target", get_h3_vectorized("latitude", "longitude", lit(TARGET_RESOLUTION)))
        df_votes = df_meta_h3.groupBy("h3_target", "city", "country_code").agg(count("*").alias("votes"))
        city_votes_dfs.append(df_votes)
        
        # Calculate Raw Scores
        df_calc_h3 = df_raw.withColumn("h3_calc", get_h3_vectorized("latitude", "longitude", lit(res)))
        hex_counts = df_calc_h3.groupBy("h3_calc").count().withColumnRenamed("count", "raw_score")

        # Apply Smoothing
        df_neighbors = hex_counts.withColumn("neighbor_info", get_kring_map("h3_calc", lit(k)))
        df_smoothed = (
            df_neighbors
            .select(col("raw_score"), explode("neighbor_info"))
            .withColumnRenamed("key", "h3_calc")
            .withColumnRenamed("value", "distance")
            .withColumn(
                "decayed_score", 
                col("raw_score") * (lit(k) - col("distance")) / lit(k)
            )
            .groupBy("h3_calc")
            .agg(spark_sum("decayed_score").alias("final_calc_score"))
        )

        # Project to Target Resolution
        if res != TARGET_RESOLUTION:
            # Explode parent hex to children
            df_projected = (
                df_smoothed
                .withColumn("children", project_to_target_res("h3_calc"))
                .select(col("final_calc_score"), explode("children").alias("h3_index"))
            )
        else:
            df_projected = df_smoothed.withColumnRenamed("h3_calc", "h3_index").select("h3_index", "final_calc_score")
        
        # Prepare for Output
        df_ready = df_projected.withColumnRenamed("final_calc_score", "score").withColumn("category_name", lit(category))
        score_dfs.append(df_ready)
        print(f"Finished processing {category}.\n")
        
    except Exception as e:
        print(f"Error processing {category}: {e}")

print("Batch processing complete.")

# COMMAND ----------

# MAGIC %md
# MAGIC # Metadata Merge

# COMMAND ----------

print("Merging results and calculating final metadata...")

if not score_dfs:
    raise ValueError("No dataframes generated. Check input tables.")

# Union all scores
df_all_scores_stacked = reduce(DataFrame.unionByName, score_dfs)

# Pivot
df_final_scores = (
    df_all_scores_stacked
    .groupBy("h3_index")
    .pivot("category_name", list(CATEGORIES_CONFIG.keys()))
    .sum("score")
    .na.fill(0)
)

# Rename columns
for cat in CATEGORIES_CONFIG.keys():
    df_final_scores = df_final_scores.withColumnRenamed(cat, f"{cat}_score")


# Determine Hexagon Location
all_votes_df = reduce(DataFrame.unionAll, city_votes_dfs)
window_spec = Window.partitionBy("h3_target").orderBy(col("total_votes").desc())
df_best_location = (
    all_votes_df
    .groupBy("h3_target", "city", "country_code")
    .agg(spark_sum("votes").alias("total_votes"))
    .withColumn("rank", row_number().over(window_spec))
    .filter(col("rank") == 1)
    .select(col("h3_target").alias("h3_index"), "city", "country_code")
)


# Calculate Centroids
df_centroids = df_final_scores.select("h3_index").distinct().withColumn("coords", get_h3_centroid("h3_index"))


# Final Join: Scores + Location + Centroids
df_final_output = (
    df_final_scores
    .join(df_best_location, on="h3_index", how="left")
    .join(df_centroids, on="h3_index", how="left")
    .select(
        col("h3_index"),
        col("coords.latitude").alias("center_latitude"),
        col("coords.longitude").alias("center_longitude"),
        col("city"),
        col("country_code"),
        *[col(f"{cat}_score") for cat in CATEGORIES_CONFIG.keys()]
    )
)

print("Merge complete.")

# COMMAND ----------

# MAGIC %md
# MAGIC # Save to Delta

# COMMAND ----------

print(f"Saving final unified dataset to: {OUTPUT_TABLE_NAME}...")
df_final_output.write.format("delta").mode("overwrite").saveAsTable(OUTPUT_TABLE_NAME)
print("Save complete.")

# COMMAND ----------

# MAGIC %md
# MAGIC # Validation

# COMMAND ----------

# Load data back
df_israel = spark.table(OUTPUT_TABLE_NAME).filter(col("country_code") == "IL").cache()

for category in CATEGORIES_CONFIG.keys():
    score_col = f"{category}_score"
    print(f"\nTop 5 Places in Israel for: {category.upper()}")
    
    display(df_israel
     .filter(col(score_col) > 0)
     .orderBy(col(score_col).desc())
     .select("city", score_col, "center_latitude", "center_longitude")
     .limit(10))
df_israel.unpersist()