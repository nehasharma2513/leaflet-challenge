// Store our API endpoint as queryUrl.
let queryUrl = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2021-01-01&endtime=2021-01-02&maxlongitude=-69.52148437&minlongitude=-123.83789062&maxlatitude=48.74894534&minlatitude=25.16517337";

// Perform a GET request to the query URL
d3.json(queryUrl).then(function (data) {
  // Once we get a response, send the data.features object to the createFeatures function.
  createFeatures(data.features);
});

function styleInfo(feature) {
  return {
      color: chooseColor(feature.geometry.coordinates[2]), //calling function to chooseColor based on depth level(present as the third coordinate for each earthquake)
      radius: chooseRadius(feature.properties.mag), //setting radius based on magnitude 
      fillColor: chooseColor(feature.geometry.coordinates[2]) //setting fillColor based on the depth level
  }
};

//Define a function to choose the fillColor of the earthquake based on the depth level
function chooseColor(depth) {
  if (depth <= 10) return "cyan";
  else if (depth > 10 & depth <= 30) return "green";
  else if (depth > 30 & depth <= 50) return "yellow";
  else if (depth > 50 & depth <= 70) return "orange";
  else if (depth > 70 & depth <= 90) return "pink";
  else return "red";
};

//Define a function to determine the radius of each earthquake marker
function chooseRadius(magnitude) {
  return magnitude*10; //multiplying to amplify the radius
};


function createFeatures(earthquakeData) {
  // Define a function that we want to run once for each feature in the features array.
  // Give each feature a popup/tooltip that describes the Magnitude, the location and depth of the earthquake.
  function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>Magnitude: ${feature.properties.mag}</h3><hr><p>Location: ${feature.properties.place}</p><p>Depth: ${feature.geometry.coordinates[2]}</p>`);
  }
  // Create a GeoJSON layer that contains the features array on the earthquakeData object.
  // Run the onEachFeature function once for each piece of data in the array.
  let earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
   // Point to layer used to create circle marker
    pointToLayer: function(feature, latlong) {
        // Determine the style of markers based on properties : radius - corresponding to magnitude of the Earthquake, color - corresponding to the depth level
        var markers = {
          radius: feature.properties.mag * 20000,
          fillColor: chooseColor(feature.geometry.coordinates[2]),
          fillOpacity: 0.7,
          color: "black",
          weight: 0.5
        }
        return L.circle(latlong,markers);
  }
});

// Send our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {
  // Create the base layers.
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })
  // Create a baseMaps object.
  let baseMaps = {
    "Street Map": street
  };
  // Create an overlay object to hold our overlay.
  let overlayMaps = {
    Earthquakes: earthquakes
  };
  // Create our map, giving it the streetmap and earthquakes layers to display on load.
  let myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 5,
    layers: [street, earthquakes]
  });
  // Create a layer control. Pass it our baseMaps and overlayMaps.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);// Add the layer control to the map.



var legend = L.control({position: 'bottomright'});

legend.onAdd = function () {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [-10, 10, 30, 50, 70, 90],
        labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + chooseColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(myMap);

}