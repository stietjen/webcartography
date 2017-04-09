/**
 * Created by Sibylle on 26.02.17.
 */
var lat;
var lon;

var map;
var search;
var restaurants;
var zoom;

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
        timeout: 15000,
        maximumAge: 0
    };
    navigator.geolocation.getCurrentPosition(success, error, options); //https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/getCurrentPosition
    //console.log("lat: " + lat + " long: " + lon);
    $("[data-toggle = 'popover']").popover();
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
    zoom = map.getView().setZoom(15);
    var overpassApiUrl = createOverpassAPI();
    $.get(overpassApiUrl, function (feedbackData) {
        restaurants = osmtogeojson(feedbackData);
        console.log(restaurants);
        if (typeof restaurants !== null) {
            displayRestaurants();
            displayInformation();
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
};

function displayRestaurants() {
    console.log(restaurants);
    for (var i = 0; i < restaurants.features.length; i++) {
        var coordinates;
        // TODO: warum 2
        if (restaurants.features[i].geometry.coordinates.length == 2) {
            var c = restaurants.features[i].geometry.coordinates;
            coordinates = ol.proj.fromLonLat([c[0], c[1]]);
            console.log(coordinates);
        }
        else {
            var c = restaurants.features[i].geometry.coordinates[0][0];
            coordinates = ol.proj.fromLonLat([c[0], c[1]]);
            console.log(coordinates);
        }

        // create button
        var place = restaurants.features[i].properties.id;
        var div= document.createElement('div');
       /* var href = document.createAttribute('href');
        href.value = "#";
        div.setAttributeNode(href);*/
        var id = document.createAttribute('id');
        id.value = place;
        div.setAttributeNode(id);
        var role = document.createAttribute('role');
        role.value = "button";
        div.setAttributeNode(role);
        var action = document.createAttribute('onclick');
        action.value = '"'+ displayInformation() +'"';
        div.setAttributeNode(action);
        /*var tab = document.createAttribute('tabindex');
        tab.value = "";
        div.setAttributeNode(tab);*/
        var pop = document.createAttribute('data-toggle');
        pop.value = "popover";
        div.setAttributeNode(pop);
        var trigger = document.createAttribute('data-trigger');
        trigger.value = "hover";
        div.setAttributeNode(trigger);

        //restaurant information
        var title = document.createAttribute('title');
        title.value = restaurants.features[i].properties.tags.name;
        div.setAttributeNode(title);
        var content = document.createAttribute('data-content');
        content.value = restaurants.features[i].properties.tags.opening_hours + restaurants.features[i].properties.tags.phone;
        console.log(restaurants.features[i].properties.tags.cuisine);
        div.setAttributeNode(content);
        /*var classAtt = document.createAttribute('class');
        classAtt.value = "popover popover-content";
        div.setAttributeNode(classAtt);*/

        var text = document.createTextNode("O");
        div.appendChild(text);

        // display button
        document.getElementById("marker").appendChild(div);

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


       /* var popup = new ol.Overlay({
            position: coordinates,
            element: document.getElementById("popover")
            //element: $('<div id="popup"><b><a href="#" data-toggle="popover" title="Testtitel" data-content="I hope there is something to read">O</a></b></div>')[0],
        });
        map.addOverlay(popup);*/
       /* var popup = new ol.Overlay({
            position: coordinates,
            element: document.getElementById(restaurants.features[i].properties.id)
        });
        popup.on('click', function() {
            var element = document.getElementById(restaurants.features[i].properties.id);
            var name = restaurants.features[i].properties.tags.name;
            var open = restaurants.features[i].properties.tags.opening_hours;

            $(element).popover('destroy');
            popup.setPosition(coordinates);
            // the keys are quoted to prevent renaming in ADVANCED mode.
            $(element).popover({
                'placement': 'top',
                'animation': false,
                'html': true,
                'content': name + '<br><p>Opening Hours:</p>' + open
            });
            $(element).popover('show');
        });
        map.addOverlay(popup);*/

};

function displayInformation() {
    document.getElementById("restaurantInfo").innerHTML = restaurants.features[i].properties.tags.name;
};

function displayCuisineChoice() {
    var choice = document.getElementById("cuisines").value;
    //console.log(choice);

    for (var i = 0; i < restaurants.features.length; i++) {
        if (restaurants.features[i].properties.tags.cuisine == choice) {
        }
       // map.removeOverlay(marker);
        displayRestaurants();
    }
}
}
/*function restaurantButton() {

 };*/