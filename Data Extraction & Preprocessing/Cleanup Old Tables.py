# Databricks notebook source
# MAGIC %md
# MAGIC # Delete Old Data

# COMMAND ----------

# Parameters
TABLES_TO_DELETE = [
    "cyprus_data_delta",
    "overture_world_bars",
    "world_data_distributed"
    ]

# Execution
print(f"Starting cleanup for {len(TABLES_TO_DELETE)} tables...")
for table_name in TABLES_TO_DELETE:
    if table_name.strip():
        try:
            print(f"\nDeleting table: {table_name}...")
            spark.sql(f"DROP TABLE IF EXISTS {table_name}")
            print(f"Successfully deleted: {table_name}")
        except Exception as e:
            print(f"\nError deleting {table_name}: {e}")

print("\nCleanup process complete.")