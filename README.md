# Mountain Grassland NDVI and Climate Analysis

This repository contains the complete workflow and codebase for the study **"Monitoring Mountain Grassland Vegetation Dynamics under Climate and Human Pressure"**, submitted to *Earth's Future*. It includes GEE data extraction, NDVI trend analysis, climate correlation, human pressure mapping, and machine learning-based prediction of future vegetation dynamics.

---

## 📁 Repository Structure

```
mountain-grassland/
├── data_preprocessing/
│   ├── gee_ndvi_climate_extraction.js    # GEE code for NDVI and climate extraction
│   ├── cmip6_preprocess.py               # CMIP6 downscaling + harmonization
│   ├── ghm_interpolation.py              # Interpolate gHM 5-year data into annual
├── trend_analysis/
│   ├── ndvi_trend_analysis.py            # Sen's slope + MK test
│   ├── ghm_hotspot.py                    # Getis-Ord Gi* analysis
│   └── impact_index.py                   # NDVI-gHM integration model
├── climate_correlation/
│   └── spearman_correlation.py           # Region-wise NDVI-climate heatmaps
├── ml_model/
│   ├── train_rf_xgb.py                   # Train and evaluate RF/XGBoost
│   ├── shap_plot.py                      # SHAP value visualization
│   └── lstm_model.py                     # LSTM training for NDVI sequences
├── future_projection/
│   ├── kde_ks_analysis.py                # KDE and KS test of LAI scenarios
│   └── delta_lai_map.py                  # ΔLAI mapping between SSP scenarios
├── shapefile/
│   ├── link                              # Google drive link (shapefiles for mountain grasslands)
├── sample_data/
│   ├── train_sample.csv                  # Sample data for ML input
│   └── lai_ssp_example.csv               # Future LAI predictions per region
├── README.md                             # This file
├── requirements.txt                      # Python dependencies
└── run_all.py                            # Sequential pipeline for end-to-end workflow
```

---

## 🌍 Data Sources

| Dataset | Source | Resolution | Period | Format |
|--------|--------|------------|--------|--------|
| MODIS NDVI | MOD13A2/MOD13A3 | 1 km | 2000–2021 | GEE |
| MODIS Land Cover | MCD12Q1 | 500 m | 2000–2021 | GEE |
| Elevation | USGS GMTED2010 | 1 km | Static | GEE |
| ERA5-Land Climate | ECMWF | ~9 km | 2000–2021 | GEE |
| Human Modification Index | gHM v1.5 | 300 m | 1990–2017 | GEE |
| CMIP6 SSP Scenarios | CESM2, MPI-ESM1-2-LR | ~100 km → 9 km | 2015–2100 | netCDF |

---

## ⚙️ Setup

### 📦 Install dependencies
```bash
pip install -r requirements.txt
```

### ▶️ Run example (modular workflow)
```bash
# Preprocess climate data from CMIP6
python data_preprocessing/cmip6_preprocess.py

# Perform NDVI trend analysis
python trend_analysis/ndvi_trend_analysis.py

# Train and explain ML models
python ml_model/train_rf_xgb.py
python ml_model/shap_plot.py

# Analyze future scenario projections
python future_projection/kde_ks_analysis.py
```

---

## 📊 Method Highlights

- NDVI trend analysis using **Sen’s slope** and **Mann–Kendall test**
- Climate–NDVI correlation using **Spearman heatmaps**
- Human pressure mapping via **gHM + Getis-Ord Gi*** analysis
- Machine learning with **Random Forest**, **XGBoost**, and **LSTM**
- Scenario modeling with **CMIP6 SSPs** and **KDE/KS-based comparison**
- **SHAP** values for model interpretation

---

## 🔁 Data Availability & Reproducibility

- GEE scripts for raw data extraction provided in `/data_preprocessing/`
- CMIP6 and LAI NetCDF data preprocessing scripts provided
- Sample CSV files for model training in `/sample_data/`
- Shapefiles of study regions provided in `/regions/masks/`

> Full reproducibility is possible by rerunning the GEE scripts and model pipelines.

---

## 📄 Citation

Once published, please cite this repository as:

```
Na, M., Zuecco, G., & Tarolli, P. (2025). Mountain Grassland NDVI and Climate Analysis (v1.0). Zenodo. https://doi.org/XXXX/zenodo.XXXXXXX
```

---

## 📬 Contact

For questions, please contact:  
**Mulun Na**  
Department of Land, Environment, Agriculture and Forestry, University of Padova  
📧 mulun.na@phd.unipd.it  
