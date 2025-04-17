// Define the study area: a global rectangle
var globe = ee.Geometry.Rectangle([-179, -58, 179, 78], 'EPSG:4326', false);

// Define start and end years
var startYear = 2000;
var endYear = 2021;

// Load MODIS land cover data (MCD12Q1) for the start and end years
var lc_start = ee.ImageCollection("MODIS/061/MCD12Q1")
    .filter(ee.Filter.calendarRange(startYear, startYear, 'year'))
    .first()
    .select('LC_Type1');

var lc_end = ee.ImageCollection("MODIS/061/MCD12Q1")
    .filter(ee.Filter.calendarRange(endYear, endYear, 'year'))
    .first()
    .select('LC_Type1');

// Extract grassland class (value 10)
var grassland_start = lc_start.eq(10);
var grassland_end = lc_end.eq(10);

// Load global DEM and extract areas above 600 meters
var dem_global = ee.Image("USGS/GMTED2010"); // Default projection: SR-ORG:6974
var dem_global_above600m = dem_global.gte(600); // Areas ≥ 600 m elevation

// Combine grassland and elevation masks
var grassland_above600m = grassland_end
    .multiply(dem_global_above600m)
    .rename('Grasslands_Above_600m'); // Grasslands above 600 m

// Load MODIS NDVI data and filter for high-quality pixels
var modis_ndvi = ee.ImageCollection("MODIS/061/MOD13A3")
    .filterDate(ee.Date.fromYMD(startYear, 1, 1), ee.Date.fromYMD(endYear, 12, 31))
    .map(function(image) {
        var quality = image.select('DetailedQA');
        var goodQuality = quality.bitwiseAnd(3).eq(0); // Best quality
        var cloudMask = quality.bitwiseAnd(1 << 8).eq(0); // Cloud-free
        var snowMask = quality.bitwiseAnd(1 << 14).eq(0); // Snow-free
        var ndvi = image.select('NDVI').multiply(0.0001); // Scale NDVI

        // Apply all masks and preserve time metadata
        return ndvi
            .updateMask(goodQuality)
            .updateMask(cloudMask)
            .updateMask(snowMask)
            .updateMask(grassland_above600m) // Apply grassland and elevation mask
            .copyProperties(image, ['system:time_start']);
    });

// Group by year and compute annual maximum NDVI (using quality mosaic)
var annual_max_ndvi = ee.ImageCollection.fromImages(
    ee.List.sequence(startYear, endYear).map(function(year) {
        year = ee.Number(year);
        var annual_collection = modis_ndvi.filter(ee.Filter.calendarRange(year, year, 'year'));
        return annual_collection.qualityMosaic('NDVI')
            .set('year', year);
    })
);

// Define the list of years
var years = ee.List.sequence(startYear, endYear);

// Export each annual maximum NDVI image to Google Drive
years.evaluate(function(yearsList) {
  yearsList.forEach(function(year) {
    var annualImage = modis_ndvi
      .filter(ee.Filter.calendarRange(year, year, 'year'))
      .qualityMosaic('NDVI')
      .set('year', year);
    
    Export.image.toDrive({
      image: annualImage,
      description: 'NDVI_AnnualMax_' + year,
      scale: 1000,
      region: globe,
      maxPixels: 1e13,
      crs: 'EPSG:4326'
    });
  });
});
