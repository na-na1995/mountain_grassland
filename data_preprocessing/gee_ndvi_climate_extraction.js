/*************************************************************
Title: Mountain Grassland NDVI and Climate Data Extraction
Description: Extracts monthly NDVI and climate variables
             (MODIS + ERA5-Land) within global mountain grassland regions.
**************************************************************

// ----------------------------
// 1. Define year/month range
// ----------------------------
var years = ee.List.sequence(2000, 2021);
var months = ee.List.sequence(1, 12);

// ----------------------------
// 2. Define mountain regions
// ----------------------------
var regions = [
  {name: 'MiddleEast', bounds: ee.Geometry.Polygon([[[15, 55], [60, 55], [60, 40], [15, 40]]])},
  {name: 'Ethiopia', bounds: ee.Geometry.Polygon([[[20, 18], [55, 18], [55, -40], [20, -40]]])},
  {name: 'Tibet', bounds: ee.Geometry.Polygon([[[75, 40], [105, 40], [105, 25], [75, 25]]])},
  {name: 'Rocky', bounds: ee.Geometry.Polygon([[[-130, 60], [-100, 60], [-100, 30], [-130, 30]]])},
  {name: 'Andes', bounds: ee.Geometry.Polygon([[[-85, 10], [-50, 10], [-50, -40], [-85, -40]]])},
  {name: 'Alps', bounds: ee.Geometry.Polygon([[[0, 50], [15, 50], [15, 40], [0, 40]]])}
];

// ----------------------------
// 3. Load masks
// ----------------------------
// MODIS land cover (LC_Type1 = 10 is grassland)
var modisLC = ee.ImageCollection("MODIS/061/MCD12Q1")
                .filter(ee.Filter.calendarRange(2001, 2021, 'year'))
                .mode()
                .select('LC_Type1');
var grassMask = modisLC.eq(10);

// Elevation > 600m
var elevation = ee.Image("USGS/GMTED2010");
var elevationMask = elevation.gte(600);

// Custom research mask (e.g. historical NDVI presence)
var researchMask = ee.Image("projects/ee-nichgudnamolon/assets/600m_SHP").gt(0);

// Final valid mask
var finalMask = grassMask.multiply(elevationMask).multiply(researchMask);

// ----------------------------
// 4. Function to extract stats
// ----------------------------
function extractStats(year, month, region) {
  year = ee.Number(year);
  month = ee.Number(month);
  var regionName = ee.String(region.name);

  // NDVI: MODIS monthly mean (MOD13A2, 16-day composite)
  var ndvi = ee.ImageCollection("MODIS/061/MOD13A2")
              .filter(ee.Filter.calendarRange(year, year, 'year'))
              .filter(ee.Filter.calendarRange(month, month, 'month'))
              .select('NDVI')
              .mean()
              .multiply(0.0001)
              .rename('NDVI');

  // ERA5 climate
  var era = ee.ImageCollection("ECMWF/ERA5_LAND/MONTHLY_AGGR")
              .filter(ee.Filter.calendarRange(year, year, 'year'))
              .filter(ee.Filter.calendarRange(month, month, 'month'))
              .first();

  var climate = ee.Image.cat([
    era.select('dewpoint_temperature_2m').subtract(273.15).rename('DewTemp'),
    era.select('temperature_2m').subtract(273.15).rename('Temp_2m'),
    era.select('skin_temperature').subtract(273.15).rename('SkinTemp'),
    era.select('soil_temperature_level_1').subtract(273.15).rename('SoilTemp_L1'),
    era.select('surface_net_solar_radiation_sum').rename('NSR'),
    era.select('total_precipitation_sum').rename('ToPrec'),
    era.select('total_evaporation_sum').rename('TotEvap'),
    era.select('volumetric_soil_water_layer_1').rename('SWC'),
    era.select('surface_latent_heat_flux_sum').rename('LHF'),
    era.select('surface_sensible_heat_flux_sum').rename('SHF'),
    era.select('u_component_of_wind_10m').pow(2)
        .add(era.select('v_component_of_wind_10m').pow(2)).sqrt()
        .rename('WindSpd')
  ]);

  // Apply mask and clip
  var regionGeometry = region.bounds;
  var maskedNDVI = ndvi.updateMask(finalMask).clip(regionGeometry);
  var maskedClimate = climate.updateMask(finalMask).clip(regionGeometry);

  // Area of valid grassland
  var area = finalMask.clip(regionGeometry)
              .multiply(ee.Image.pixelArea())
              .multiply(ee.Image.constant(1)) // named "constant"
              .reduceRegion({
                reducer: ee.Reducer.sum(),
                geometry: regionGeometry,
                scale: 1000,
                maxPixels: 1e13
              }).get('constant');

  // Mean values
  var ndviMean = maskedNDVI.reduceRegion({
                  reducer: ee.Reducer.mean(),
                  geometry: regionGeometry,
                  scale: 1000,
                  maxPixels: 1e13
                }).get('NDVI');

  var climateStats = maskedClimate.reduceRegion({
                      reducer: ee.Reducer.mean(),
                      geometry: regionGeometry,
                      scale: 1000,
                      maxPixels: 1e13
                    });

  return ee.Feature(null, {
    'year': year,
    'month': month,
    'region': regionName,
    'NDVI': ndviMean,
    'GrassArea_m2': area
  }).set(climateStats);
}

// ----------------------------
// 5. Batch loop and flatten
// ----------------------------
var featureList = years.map(function(y) {
  return months.map(function(m) {
    return regions.map(function(r) {
      return extractStats(y, m, r);
    });
  });
}).flatten().flatten();

// ----------------------------
// 6. Export to Google Drive
// ----------------------------
Export.table.toDrive({
  collection: ee.FeatureCollection(featureList),
  description: 'MountainGrasslands_NDVI_Climate_2000_2021',
  fileFormat: 'CSV'
});
