/* https://www.paulamoraga.com/tutorial-gee/
Importing Italy administrative boundaries */

var worldcountries = ee.FeatureCollection('USDOS/LSIB_SIMPLE/2017');
var filterCountry = ee.Filter.eq('country_na', 'Italy');
var country = worldcountries.filter(filterCountry);

Map.addLayer(country);
Map.centerObject(country, 6);

// Importing NO2 values

var no2ic = ee.ImageCollection('COPERNICUS/S5P/NRTI/L3_NO2').select('NO2_column_number_density');

// Filtering and averaging NO2 values

var filterMonth = ee.Filter.calendarRange(2, 5, 'month');
var  no2 = no2ic.filter(filterMonth);

var filter19 = ee.Filter.calendarRange(2019, 2019, 'year');
var filter20 = ee.Filter.calendarRange(2020, 2020, 'year');

var no2pre  = no2.filter(filter19).mean().multiply(1e6).clip(country);
var no2post = no2.filter(filter20).mean().multiply(1e6).clip(country);

// Adding data to the map

var vizParams = {
  min: 0,
  max: 200,
  palette: ['black', 'purple', 'green', 'red']
};

Map.addLayer(no2pre, vizParams, 'no2pre');
Map.addLayer(no2post, vizParams, 'no2post');

// Visualizing maps using a screen split display

// Add no2pre to the default Map
Map.addLayer(no2pre, vizParams, 'splitpre');
// Make another Map and add no2post to it
var Map2 = ui.Map();
Map2.addLayer(no2post, vizParams, 'splitpost');
// Link the default Map to the Map2
var linker = ui.Map.Linker([ui.root.widgets().get(0), Map2]);
// Create a SplitPanel which holds the linked maps side-by-side
// wipe is set to true to let the user swipe the handle back and forth between the two visualizations
var splitPanel = ui.SplitPanel({
  firstPanel: linker.get(0),
  secondPanel: linker.get(1),
  orientation: 'horizontal',
  wipe: true,
  style: {stretch: 'both'}
});
// Set the SplitPanel as the only thing in root
ui.root.widgets().reset([splitPanel]);
// Center the SplitPanel on coordinates (10, 44) and set zoom level to 6
linker.get(0).setCenter(10, 44, 6);

// Saving maps

Export.image.toDrive({image: no2pre,description: 'mappre', region: country});
Export.image.toDrive({image: no2post, description: 'mappost', region: country});
