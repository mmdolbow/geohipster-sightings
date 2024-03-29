/**
 * JavaScript to produce a map of geoHipster sightings
 * 
 * Originally freely based on from (c) Ralph Straumann, www.ralphstraumann.ch, 2014
 * Questions: milo@codefor.nl
 * 
 * Edited by Mike Dolbow with a goal of replacing our sightings map, not our Twitter follower map, 2019-11-25
 * 
 */
var maptype = "world"; // or "mapbox"

/**
 * Countryset gets filled after reading all the hipsters. and is used to color the worldmap.
 * I intend to use a full ramp, but am working out how to do that.
 * From Mike: since we don't have that column in the sightings data, let's skip that part. 2019-11-25
 */
var countryset = {};

$(document).ready(function () {
    var map = setMap(maptype);
    getData(map);

});

/**
 * Retrieve the geoHipsters via AJAX call to local CSV file
 * @param {*} map 
 */
function getData(map) {
    $.ajax({
        type: 'GET',
        dataType: 'text',
        /**
         * The url should be replaced by a maintained source and may also be changed to a
         * url that produces geojson which would mean this script would have to be
         * rewritten slightly.
         * Mike has attempted to load in a new CSV here for data of sightings, not Twitter followers.
         */
        //Original url: 'http://www.ralphstraumann.ch/projects/geohipster-map/user_geotable.csv',
        url: './data/sighting_table.csv',
        error: function () {
            alert('Data loading didn\'t work, unfortunately.');
        },
        success: function (response) {
            console.log("Hipster table loaded. Proceeding to pour PBR.")
            csv = getHipsters(response);
            markers = new L.MarkerClusterGroup();
            markers.addLayer(csv);
            map.addLayer(markers);
        },
        complete: function () {
            console.log('Data loading complete.');
        }
    });
}

/**
 * Transform CSV file into Leaflet Layer
 * @param {*} csv 
 */
function getHipsters(csv) {
    var hipsters = L.geoCsv(null, {
        onEachFeature: function (feature, layer) {
            //var country = feature.properties.country ? '<br/><i>(' + feature.properties.country + ')</i>' : ''
            var popup = '<b>GeoHipster: '+feature.properties.geohipster +'</b><br>';
            popup += 'Location: ' + feature.properties.location +'<br>';
            popup += feature.properties.photourl;
            //popup += country;
            layer.bindPopup(popup);
            //countryset[feature.properties.country] = countryset[feature.properties.country] ? countryset[feature.properties.country] + 1 : 1;
        },
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng);
        },
        firstLineTitles: true,
        titles: ['geohipster', 'lat', 'lng', 'location','photourl'],
        deleteDoubleQuotes: true,
        fieldSeparator: ';' //semicolon important so you can have commas in cell
    });
    hipsters.addData(csv);
    //console.log(countryset);
    //if (maptype === "mapbox") {
        mapboxMap(map);
    //} else {
        //worldMap(map);
    //}
    return hipsters;
}

/**
 * Initialize the map
 */
function setMap(type) {
    // Set up the map
    map = new L.Map('map', {
        center: [0, 0],
        zoom: 2,
        minZoom: 2,
        maxZoom: 18,
        zoomControl: true //not sure why we'd disable this -- Mike
    });

    return map;
}

/**
 * Load Mapbox base layer
 * @param {*} map 
 */
function mapboxMap(map) {
    var mapbox_token = 'pk.eyJ1IjoibWlibG9uIiwiYSI6ImNrMGtvajhwaDBsdHQzbm16cGtkcHZlaXUifQ.dJTOE8FJc801TAT0yUhn3g';
    L.tileLayer(
        'https://api.mapbox.com/styles/v1/mapbox/emerald-v8/tiles/{z}/{x}/{y}?access_token=' + mapbox_token, {
        tileSize: 512,
        zoomOffset: -1,
        attribution: '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
}

function worldMap(map, max = 100) {
    /**
     * Determine the color for a country based on the ammount of hipsters
     * @param {*} percent 
     * @param {*} start 
     * @param {*} end 
     */
    function getRampColor(value) {
        if (isNaN(value)) return "#ccc";
        if (value < 10) return "#BBC5BE";
        if (value < 50) return "#AABEB1";
        if (value < 100) return "#99B6A3";
        if (value < 250) return "#88AF95";
        if (value < 500) return "#78A888";
        if (value < 1000) return "#67A17A";
        if (value < 2000) {
            return "#569A6C";
        } else {
            return "#45925E";
        }
    }

    function zoomToFeature(e) {
        var layer = e.target;
        map.fitBounds(layer.getBounds());
    }

    function resetHighlight(e) {
        var layer = e.target;
        worldLayer.resetStyle(layer);
    }

    function highlightFeature(e) {
        var layer = e.target;
        layer.setStyle({
            color: '#fff'
        });

        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }

    }

    function onEachFeature(feature, layer) {
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
            click: zoomToFeature
        });
    }
    function worldStyle(feature) {
        // How many hipsters?
        //var hipsterspercountry = countryset[feature.properties.NAME];
        var fillcolor = "#2f7d3d";
        //var fillcolor = getRampColor(hipsterspercountry); // Needs more work


        return {
            fillColor: fillcolor,
            weight: 1,
            opacity: 1,
            color: '#7d7b6d',
            fillOpacity: .5
        };
    };

    $.getJSON('./data/worldmap.geojson', function (response) {
        worldLayer = L.geoJSON(response, { style: worldStyle, onEachFeature: onEachFeature }).addTo(map);
    });

}