/**
 * Created by Sibylle on 26.02.17.
 */
var lat;
var lon;

var map;
var search;
var restaurants;

$(document).ready(function () {
    windowAdapt();

    $(window).resize(function () {
        windowAdapt();
    });
    $("#navButton").click(function () {
        search = $("#navBar").val();
    });
    map = new ol.Map({
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            })
        ],
        target: 'map',
        view: new ol.View({
            center: [0, 0],
            zoom: 2
        })
    });
    map.addControl(new ol.control.Zoom());
    var options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
    };
    navigator.geolocation.getCurrentPosition(success, error, options); //https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/getCurrentPosition
    //console.log("lat: " + lat + " long: " + lon);
    $('[data-toggle="popover"]').popover({
        content: ''
    });
});
function windowAdapt() {
    $("#map").height($(window).height());
    $("#map").width($(window).width());
};
function success(pos) {
    var crd = pos.coords;
    lat = crd.latitude;
    lon = crd.longitude;

    map.getView().setCenter(ol.proj.fromLonLat([lon, lat]));
    map.getView().setZoom(15);
    var overpassApiUrl = createOverpassAPI();
    $.get(overpassApiUrl, function (feedbackData) {
        restaurants = osmtogeojson(feedbackData);
        console.log(restaurants);
        if (typeof restaurants !== null) {
            displayRestaurants();
        }
    });
};
function error(err) {
    console.warn('ERROR ' + err.code + ':' + err.message);
};
function createOverpassAPI() {
    var extent = map.getView().calculateExtent(map.getSize());
    extent = ol.proj.transformExtent(extent, 'EPSG:3857', 'EPSG:4326');
    var bounds = extent[1] + ',' + extent[0] + ',' + extent[3] + ',' + extent[2];
    var nodeQuery = 'node[' + "amenity=restaurant" + '](' + bounds + ');';
    var wayQuery = 'way[' + "amenity=restaurant" + '](' + bounds + ');';
    var relationQuery = 'relation[' + "amenity=restaurant" + '](' + bounds + ');';
    var query = '?data=[out:xml][timeout:25];(' + nodeQuery + wayQuery + relationQuery + ');out body;>;out skel qt;';
    var baseUrl = 'http://overpass-api.de/api/interpreter';
    return baseUrl + query;
    console.log(restaurants);
};
function displayRestaurants() {
    console.log(restaurants);
    for (var i = 0; i < restaurants.features.length; i++) {
        var coordinates;
        if (restaurants.features[i].geometry.coordinates.length == 2) {
            var c = restaurants.features[i].geometry.coordinates;
            coordinates = ol.proj.fromLonLat([c[0], c[1]]);
        }
        else {
            var c = restaurants.features[i].geometry.coordinates[0][0];
            coordinates = ol.proj.fromLonLat([c[0], c[1]]);
        }

        // create button
        var place = restaurants.features[i].properties.id;
        var a = document.createElement('a');
        var type = document.createAttribute('type');
        type.value = "a";
        a.setAttributeNode(type);
        var id = document.createAttribute('id');
        id.value = place;
        a.setAttributeNode(id);
        var role = document.createAttribute('role');
        role.value = "button";
        a.setAttributeNode(role);
        var tab = document.createAttribute('tabindex');
        tab.value = "";
        a.setAttributeNode(tab);
        var pop = document.createAttribute('data-toggle');
        pop.value = "popover";
        a.setAttributeNode(pop);
        var trigger = document.createAttribute('data-trigger');
        trigger.value = "click";
        a.setAttributeNode(trigger);

        //restaurant information
        var title = document.createAttribute('title');
        title.value = restaurants.features[i].properties.tags.name;
        console.log(title.value);
        a.setAttributeNode(title);
        var content = document.createAttribute('data-content');
        content.value = restaurants.features[i].properties.tags.opening_hours + restaurants.features[i].properties.tags.phone;
        console.log(content.value);
        a.setAttributeNode(content);
        var classAtt = document.createAttribute('class');
        classAtt.value = " marker";
        a.setAttributeNode(classAtt);

        /*var onclick = document.createAttribute('onclick');
         onclick.value = alert("klicken funktioniert");
         a.setAttributeNode(onclick);*/
        var text = document.createTextNode("R");
        a.appendChild(text);

        // display button
        document.getElementById("popup").appendChild(a);

        //icon
        /*var span = document.createElement('span');
         var classIcon = document.createAttribute('class');
         classIcon.value = "glyphicons glyphicons-cutlery";
         span.setAttributeNode(classIcon);
         document.getElementById(place).appendChild(span);*/

        var marker = new ol.Overlay({ //http://openlayers.org/en/latest/examples/overlay.html
            position: coordinates,
            positioning: 'center-center',
            element: document.getElementById(restaurants.features[i].properties.id),
            stopEvent: false
        });
        map.addOverlay(marker);

// restaurants without button function
        /*var div = document.createElement('div');
         var id = document.createAttribute('id');
         id.value = "" + restaurants.features[i].properties.id + "";
         div.setAttributeNode(id);
         var classAtt = document.createAttribute('class');
         classAtt.value = "marker";
         div.setAttributeNode(classAtt);
         document.getElementById("marker").appendChild(div);
         var marker = new ol.Overlay({ //http://openlayers.org/en/latest/examples/overlay.html
         position: coordinates,
         positioning: 'center-center',
         element: document.getElementById(restaurants.features[i].properties.id),
         stopEvent: false
         });
         map.addOverlay(marker);*/

    }
    ;
};
/*function restaurantButton() {

 };*/