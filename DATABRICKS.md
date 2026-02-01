# Running "Perfect Stay" on Databricks

This guide explains how to run the user interface directly within Databricks using the `Perfect Stay - User Interface.ipynb` notebook.

## 🚀 Setup Instructions

### 1. Clone the file Perfect Stay - User Interface.ipynb into your workspace on databricks.

### 2. Run the Interface

1.  Open the notebook.
2.  Ensure your cluster is attached (top right dropdown).
3.  **Run All** cells (or press `Shift + Enter` to run specific cells).

---DATA---
Our project is based around 4 data sources:

1. The provided Airbnb dataset.
2. The provided Booking.com dataset.
3. Overture Maps dataset.
4. Scraped data of the 2026 world cup matches.

We uploaded the following to azure:
1. The scraped data of the 2026 world cup matches.

Notice that uploading the rest of our files, specifically also the Overture Maps dataset, isn't possible, duo to limitations over the provided SAS TOKENS.
These datasets are huge and therefore can't be uploaded manually.
To access this data, you can use in any notebook the following code lines:
OVERTURE_PATH = "wasbs://release@overturemapswestus2.blob.core.windows.net/2025-12-17.0/theme=places/type=place"
overture_df = spark.read.format("parquet").load(OVERTURE_PATH)
