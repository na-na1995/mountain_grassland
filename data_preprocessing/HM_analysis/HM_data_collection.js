// Define the global research area (rectangle) for analysis
var globe = ee.Geometry.Rectangle([-179, -58, 179, 78], null, false);

// Define the start and end years for NDVI trend analysis
var startYear = 2001;
var endYear = 2021;

// Get land cover data (MODIS MCD12Q1) for both the start and end years
var lc_start = ee.ImageCollection("MODIS/061/MCD12Q1")
    .filter(ee.Filter.calendarRange(startYear, startYear, 'year'))
    .first()
    .select('LC_Type1');
var lc_end = ee.ImageCollection("MODIS/061/MCD12Q1")
    .filter(ee.Filter.calendarRange(endYear, endYear, 'year'))
    .first()
    .select('LC_Type1');

// Assume grassland category is 10
var grassland_start = lc_start.eq(10);
var grassland_end = lc_end.eq(10);

// Use DEM data to filter areas above 600 meters
var dem_global = ee.Image("USGS/GMTED2010");
var dem_global_above600m = dem_global.gte(600);

// Combine grassland and elevation filters for start and end years
var grassland_above600m_start = grassland_start.multiply(dem_global_above600m).rename('Grasslands_Above_600m_Start');
var grassland_above600m_end = grassland_end.multiply(dem_global_above600m).rename('Grasslands_Above_600m_End');

// Load the latest Global Human Modification data (cumulative impact)
var ghm = ee.ImageCollection("CSP/HM/GlobalHumanModification").mosaic();

// Mask the GHM data to show areas where grasslands above 600m are impacted by human modification
var human_modification_masked = ghm.updateMask(grassland_above600m_end);

// Visualize the human modification index for grasslands above 600m
var ghm_palette = ['blue', 'yellow', 'red'];
Map.addLayer(human_modification_masked.clip(globe), 
             {min: 0, max: 1, palette: ghm_palette}, 'Human Modification (Grasslands Above 600m)');


// Export Human Modification data to Google Drive
Export.image.toDrive({
  image: human_modification_masked.clip(globe),
  description: 'Human_Modification_Grasslands_Above_600m',
  scale: 3000,
  region: globe,
  maxPixels: 1e13,
  crs: 'EPSG:4326'
});

// Center the map on the research area
Map.centerObject(globe, 3);
