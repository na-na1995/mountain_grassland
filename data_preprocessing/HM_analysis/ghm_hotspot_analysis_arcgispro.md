**Figure 7: NDVI Trends under Human Modification Pressure**
This figure evaluates the interaction between human pressure (Global Human Modification Index, gHM) and NDVI trends (2000–2021) across six major mountain regions.

**1. gHM Data Extraction and Classification**
Source: CSP/HM/GlobalHumanModification

Filtered for: MODIS grassland (LC_Type1 = 10) above 600m (GMTED2010 DEM)

Classified into 5 pressure levels:

0: No Pressure (≤0.1)

1: Low (≤0.3)

2: Moderate (≤0.5)

3: Sub-high (≤0.7)

4: High (>0.7)

2. NDVI Trend Classification (2000–2021)

3. Hotspot Analysis (ArcGIS Pro)
Tool: Spatial Statistics Tools → Mapping Clusters → Hot Spot Analysis (Getis-Ord Gi*)

Input: NDVI trend class raster and gHM class raster

Purpose: Identify spatial clusters of human pressure aligned with vegetation degradation.

Output
Figure 7 maps the spatial overlap between gHM pressure and NDVI change categories, revealing regional contrasts in human-vegetation interaction intensity.
