// 定义研究区域
var globe = ee.Geometry.Rectangle([-179, -58, 179, 78], 'EPSG:4326', false);

// 定义起止年份
var startYear = 2000;
var endYear = 2021;

// 获取土地覆盖数据（MODIS MCD12Q1）
var lc_start = ee.ImageCollection("MODIS/061/MCD12Q1")
    .filter(ee.Filter.calendarRange(startYear, startYear, 'year'))
    .first()
    .select('LC_Type1');

var lc_end = ee.ImageCollection("MODIS/061/MCD12Q1")
    .filter(ee.Filter.calendarRange(endYear, endYear, 'year'))
    .first()
    .select('LC_Type1');

// 草地分类为 10
var grassland_start = lc_start.eq(10);
var grassland_end = lc_end.eq(10);

// 使用 DEM 数据过滤高于 600 米的区域
var dem_global = ee.Image("USGS/GMTED2010"); // 默认使用 SR-ORG:6974 投影
var dem_global_above600m = dem_global.gte(600); // 600m 以上

// 结合草地和海拔过滤
var grassland_above600m = grassland_end
    .multiply(dem_global_above600m)
    .rename('Grasslands_Above_600m'); // 草地和海拔交集

// 获取 NDVI 数据并筛选高质量像素
var modis_ndvi = ee.ImageCollection("MODIS/061/MOD13A3")
    .filterDate(ee.Date.fromYMD(startYear, 1, 1), ee.Date.fromYMD(endYear, 12, 31))
    .map(function(image) {
        var quality = image.select('DetailedQA');
        var goodQuality = quality.bitwiseAnd(3).eq(0); // 最高质量
        var cloudMask = quality.bitwiseAnd(1 << 8).eq(0); // 无云
        var snowMask = quality.bitwiseAnd(1 << 14).eq(0); // 无雪
        var ndvi = image.select('NDVI').multiply(0.0001); // 缩放 NDVI
        
        // 返回完整影像并确保应用掩膜和研究区域
        return ndvi
            .updateMask(goodQuality)
            .updateMask(cloudMask)
            .updateMask(snowMask)
            .updateMask(grassland_above600m) // 应用草地和海拔掩膜
            .copyProperties(image, ['system:time_start']);
    });

// 按年分组并计算每年的最大 NDVI
var annual_max_ndvi = ee.ImageCollection.fromImages(
    ee.List.sequence(startYear, endYear).map(function(year) {
        year = ee.Number(year);
        var annual_collection = modis_ndvi.filter(ee.Filter.calendarRange(year, year, 'year'));
        return annual_collection.qualityMosaic('NDVI')
            .set('year', year);
    })
);


// 定义年份列表
var years = ee.List.sequence(startYear, endYear);

years.evaluate(function(yearsList) {
  yearsList.forEach(function(year) {
    var annualImage = modis_ndvi
      .filter(ee.Filter.calendarRange(year, year, 'year'))
      .qualityMosaic('NDVI')
      .set('year', year);
    
    Export.image.toDrive({
      image: annualImage,
      description: 'NDVI_AnnualMax_' + year,
      scale: 5000,
      region: globe,
      maxPixels: 1e13,
      crs: 'EPSG:4326'
    });
  });
});

