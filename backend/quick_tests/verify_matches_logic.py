import sys
import os
import pandas as pd

# Add backend to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    import server
    print("\n--- Testing Matches Loading ---")
    if server.df_matches.empty:
        print("FAIL: df_matches is empty")
    else:
        print(f"SUCCESS: Loaded {len(server.df_matches)} matches")
        print("Columns:", server.df_matches.columns.tolist())
        print("First match:", server.df_matches.iloc[0].to_dict())

except ImportError as e:
    print(f"Import failed: {e}")
except Exception as e:
    print(f"Error: {e}")
