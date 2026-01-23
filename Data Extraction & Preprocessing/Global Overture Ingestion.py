# Databricks notebook source
# MAGIC %md
# MAGIC # Imports & Configuration

# COMMAND ----------

# Imports
from pyspark.sql.functions import col, lit

# Parameters
OVERTURE_PATH = "wasbs://release@overturemapswestus2.blob.core.windows.net/2025-12-17.0/theme=places/type=place"
CATEGORIES_CONFIG = {
    "nightlife": {
        "tags": ['bar', 'pub', 'biergarten', 'nightclub', 'lounge'],
        "output_table": "Itav_world_nightlife"
    },
    "nature": {
        "tags": ['national_park', 'nature_reserve', 'lake', 'botanical_garden', 'forest'],
        "output_table": "Itav_world_nature"
    },
    "tourist": {
        "tags": ['museum', 'zoo', 'amusement_park', 'aquarium', 'tourist_attraction', 'theme_park', 'art_gallery'],
        "output_table": "Itav_world_tourist"
    },
    "shopping": {
        "tags": ['mall', 'shopping_mall', 'marketplace', 'flea_market', 'department_store', 'outlet_store'],
        "output_table": "Itav_world_shopping"
    },
    "relaxation": {
        "tags": ['spa', 'sauna', 'golf_course', 'massage', 'public_bath', 'hot_spring', 'beauty_salon'],
        "output_table": "Itav_world_relaxation"
    }
}

print(f"Configuration loaded.")
print(f"Reading from: {OVERTURE_PATH}")
print(f"Categories configured: {list(CATEGORIES_CONFIG.keys())}")


# COMMAND ----------

# MAGIC %md
# MAGIC # Data Processing

# COMMAND ----------

# Load Data
print("Acquiring data from Overture Maps (Cloud Parquet)...")
overture_df = spark.read.format("parquet").load(OVERTURE_PATH)

# Iterate through categories
for category, config in CATEGORIES_CONFIG.items():

    print(f"\nProcessing Category: {category.upper()}")

    tags = config['tags']
    table_name = config['output_table']
    
    # Filter
    df_filtered = overture_df.filter(
        (col("categories.primary").isin(tags)) & 
        (col("addresses")[0].getItem("country").isNotNull()) &
        (col("confidence") > 0.80)
    )
    
    # Select Columns
    df_final = df_filtered.select(
        col("id").alias("place_id"),
        col("names.primary").alias("name"),
        col("categories.primary").alias("place_type"),
        col("bbox.ymin").alias("latitude"),
        col("bbox.xmin").alias("longitude"),
        col("addresses")[0].getItem("locality").alias("city"),
        col("addresses")[0].getItem("country").alias("country_code"), 
        col("sources")[0].getItem("dataset").alias("data_source"),
        lit(category).alias("category_group")
    ).dropDuplicates(["place_id"])
    
    # Save to Delta
    print(f"Saving to Delta table: {table_name}...")
    df_final.write.format("delta").mode("overwrite").saveAsTable(table_name)
    
    count = df_final.count()
    print(f"Saved {count} records to {table_name}.")

print("\nAll categories processed successfully!")

# COMMAND ----------

# MAGIC %md
# MAGIC # Validation

# COMMAND ----------

# Verify results
print("Verifying Output Tables:")

for category, config in CATEGORIES_CONFIG.items():
    table_name = config['output_table']
    try:
        print(f"\nSample data from: {table_name} ({category})")
        display(spark.table(table_name).limit(10))
    except Exception as e:
        print(f"Error reading {table_name}: {e}")