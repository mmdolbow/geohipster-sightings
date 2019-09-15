/**
 * JavaScript to produce a map of geoHipster sightings
 * 
 * freely based on from (c) Ralph Straumann, www.ralphstraumann.ch, 2014
 * Questions: milo@codefor.nl
 * 
 */

$(document).ready(function () {
    var map = setMap();
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
         * rewritten slightly
         */
        //url: 'http://www.ralphstraumann.ch/projects/geohipster-map/user_geotable.csv',
        url: './data/user_geotable.csv',
        error: function () {
            alert('Data loading didn\'t work, unfortunately.');
        },
        success: function (response) {
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
            var popup = '<a href="http://www.twitter.com/' + feature.properties.account + '"><b>' + feature.properties.name + '</b> &ndash; @' + feature.properties.account + '</a><br>';
            popup += '<b>' + feature.properties.followers + '</b> followers and following <b>' + feature.properties.following + '</b> other users.<br>';
            popup += 'On average <b>' + feature.properties.tweetspermonth + '</b> tweets per month.<br>'
            popup += 'Active since <b>' + feature.properties.accountagemonths + '</b> months.';
            layer.bindPopup(popup);
        },
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng);
        },
        firstLineTitles: true
    });
    hipsters.addData(csv);
    return hipsters;
}

/**
 * Initialize the map
 */
function setMap() {
    var mapbox_token = 'pk.eyJ1IjoibWlibG9uIiwiYSI6ImNrMGtvajhwaDBsdHQzbm16cGtkcHZlaXUifQ.dJTOE8FJc801TAT0yUhn3g';
    // Set up the map
    map = new L.Map('map', {
        center: [0, 0],
        zoom: 2,
        minZoom: 2,
        maxZoom: 18,
        zoomControl: false
    });
    L.tileLayer(
        'https://api.mapbox.com/styles/v1/mapbox/emerald-v8/tiles/{z}/{x}/{y}?access_token=' + mapbox_token, {
        tileSize: 512,
        zoomOffset: -1,
        attribution: '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    return map;
}