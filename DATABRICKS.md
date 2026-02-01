# Running "Perfect Stay" on Databricks

This guide explains how to run the user interface directly within Databricks using the `Perfect Stay - User Interface.ipynb` notebook.

## 📋 Prerequisites

*   Access to a **Databricks Workspace**.
*   A running **Databricks Cluster**.

## 🚀 Setup Instructions

### 1. Clone the Repository into Databricks

Since the project is hosted on GitHub, you can clone it directly into Databricks Repos.

1.  Log in to your Databricks workspace.
2.  In the sidebar, click on **Workspace** > **Repos** (or just **Repos** depending on your version).
3.  Click **Add Repo**.
4.  In the dialog:
    *   **Git repository URL**: `https://github.com/raquelgold/Perfect-Stay.git`
    *   **Git provider**: GitHub
    *   **Repo name**: `Perfect-Stay` (or your preferred name)
5.  Click **Create Repo**.

### 2. Locate the Interface Notebook

1.  Navigate into the newly cloned `Perfect-Stay` repo folder in Databricks.
2.  Locate the file named:
    
    📄 **`Perfect Stay - User Interface.ipynb`**

### 3. Run the Interface

1.  Open the notebook.
2.  Ensure your cluster is attached (top right dropdown).
3.  **Run All** cells (or press `Shift + Enter` to run specific cells).
4.  The interface should render directly within the notebook output area (using IPyWidgets or similar framework as defined in the notebook).

---

### ⚠️ Note on Data

Ensure that the required data files (CSVs) are accessible to the notebook. 
*   If the notebook expects files in a specific path (e.g., `/dbfs/FileStore/...` or relative paths), you may need to upload the CSVs from Azure Blob to the Databricks File System (DBFS) or mount your Azure Blob Storage container to Databricks.
*   Refer to the notebook's code for specific data loading paths.
