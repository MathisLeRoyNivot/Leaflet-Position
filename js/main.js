let longitude = 51.5;
let lattitude = -0.09;

let longitude1 = 51.51;
let lattitude1 = -0.1;

let map = L.map('map-bloc').setView([longitude, lattitude], 13);

L.tileLayer('https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}{r}.png', {
	attribution: '<a href="https://wikimediafoundation.org/wiki/Maps_Terms_of_Use">Wikimedia</a>',
	minZoom: 2,
	maxZoom: 15
}).addTo(map);


L.marker([longitude, lattitude]).addTo(map)
    .bindPopup(`Position 1.<br> Lng. ${longitude} & Lat. ${lattitude}.`)
    .openPopup();


L.marker([longitude1, lattitude1]).addTo(map)
    .bindPopup(`Position 2.<br> Lng. ${longitude1} & Lat. ${lattitude1}.`)
    .openPopup();

// Onload, execute the following code
$(document).ready(() => {

    // Load JSON file
    var json = require('./gps-coords.json');
    $.getJSON("./gps-coord.json", function(json) {
        console.log(json); // this will show the info it in firebug console
    });
    
})