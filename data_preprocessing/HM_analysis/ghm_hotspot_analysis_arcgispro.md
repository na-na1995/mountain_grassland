## **Figure 7: NDVI Trends under Human Modification Pressure**

This figure evaluates the interaction between human pressure (Global Human Modification Index, gHM) and NDVI trends (2000–2021) across six major mountain regions.

---

### **1. gHM Data Extraction and Classification**

- **Source**: [`CSP/HM/GlobalHumanModification`](https://developers.google.com/earth-engine/datasets/catalog/CSP_HM_GlobalHumanModification)
- **Filtered for**: MODIS grassland (`LC_Type1 = 10`) above 600m (using GMTED2010 DEM)
- **Classified into 5 pressure levels**:
  - `0`: No Pressure (≤ 0.1)  
  - `1`: Low (≤ 0.3)  
  - `2`: Moderate (≤ 0.5)  
  - `3`: Sub-high (≤ 0.7)  
  - `4`: High (> 0.7)

GEE script used: [`HM_data_collection.js`](data_preprocessing/HM_analysis/HM_data_collection.js)

---

### **2. NDVI Trend Classification (2000–2021)**

- Based on annual maximum NDVI from MODIS MOD13A3.
- Trend detection using Theil-Sen slope estimator and Mann-Kendall significance test.
- Reclassification rule combining slope and p-value thresholds (see Supplementary Table S1).

Analysis pipeline provided in:  
[`trend_analysis/ndvi_trend_analysis.py`](../trend_analysis/ndvi_trend_analysis.py)

---

### **3. Hotspot Analysis (ArcGIS Pro)**

- **Tool**:  
  *Spatial Statistics Tools → Mapping Clusters → Hot Spot Analysis (Getis-Ord Gi\*)*
- **Input Layers**:
  - NDVI trend classification raster  
  - gHM class raster
- **Purpose**: Identify spatial clusters where NDVI degradation coincides with intense human modification.

---

### **4. Output**

Figure 7 maps the spatial overlap between gHM pressure and NDVI trend categories, revealing regional contrasts in the intensity of human-vegetation interactions.
