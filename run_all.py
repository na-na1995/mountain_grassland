# run_all.py

import os
import subprocess

def run_script(path):
    print(f"\n--- Running: {path} ---")
    try:
        subprocess.run(['python', path], check=True)
    except subprocess.CalledProcessError as e:
        print(f"Failed to run {path}: {e}")
    except Exception as e:
        print(f"Unexpected error running {path}: {e}")

if __name__ == '__main__':
    print("=== Global Mountain Grassland Analysis Workflow ===")

    # Step 1: Data Preprocessing
    print("\n[Step 1] Data Preprocessing")
    run_script('data_preprocessing/cmip6_preprocess.py')
    run_script('data_preprocessing/ghm_interpolation.py')
    print(">> NOTE: GEE code (gee_ndvi_climate_extraction.js) must be run on https://code.earthengine.google.com/ manually.")

    # Step 2: Trend Analysis
    print("\n[Step 2] Trend Analysis")
    run_script('trend_analysis/ndvi_trend_analysis.py')
    run_script('trend_analysis/ghm_hotspot.py')
    run_script('trend_analysis/impact_index.py')

    # Step 3: Climate-NDVI Correlation
    print("\n[Step 3] Climate Correlation Analysis")
    run_script('climate_correlation/spearman_correlation.py')

    # Step 4: Machine Learning Model Training
    print("\n[Step 4] Machine Learning Models")
    run_script('ml_model/train_rf_xgb.py')
    run_script('ml_model/shap_plot.py')
    run_script('ml_model/lstm_model.py')

    # Step 5: Future Projections
    print("\n[Step 5] Future Projections and Scenario Analysis")
    run_script('future_projection/kde_ks_analysis.py')
    run_script('future_projection/delta_lai_map.py')

    print("\n=== All steps completed successfully ===")
