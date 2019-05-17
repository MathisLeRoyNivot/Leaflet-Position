// Onload, execute the following code
$(document).ready(() => {

    let map = L.map('map-bloc').setView([47.25, -1.40], 9.5);

    L.tileLayer('https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}{r}.png', {
        attribution: '<a href="https://wikimediafoundation.org/wiki/Maps_Terms_of_Use">Wikimedia</a>',
        minZoom: 2,
        maxZoom: 15
    }).addTo(map);
    
    $.getJSON("http://127.0.0.1:5500/js/gps-coord.json", function (json) {

        let latlngs = Array();
           
        for (var key in json) {
            if (json.hasOwnProperty(key)) {

                let id = json[key].id;
                let lattitude = json[key].lattitude;
                let longitude = json[key].longitude;
                let dateTime = json[key].datetime;
                let description = json[key].description;

                L.marker([lattitude, longitude]).addTo(map)
                    .bindPopup(`<strong>Position #${id}<br>Longitude : </strong> ${longitude} <strong> | Lattitude : </strong> ${lattitude}<br><strong>Lieux : </strong> ${description}<br><strong>Date : </strong> ${dateTime}`);
                    // .openPopup(); 

                const newMarker = [lattitude, longitude];
                // Push data collected in newMarker variable to the array
                latlngs.push(newMarker);
            }
        }

        let polyline = L.polyline(latlngs, {
            color: 'blue'
        }).addTo(map);

        // zoom the map to the polyline
        map.fitBounds(polyline.getBounds());

        // Total distance sum
        let totalDistance = 0;

        for (var i = 0; i < latlngs.length - 1; i++) {
            totalDistance += L.latLng(latlngs[i]).distanceTo(latlngs[i + 1]);
        }

        // Distance format
        // If distance is under 1000m / 1km
        if(totalDistance < 1000) {
            // 2 decimal arround & display distance in meters
            totalDistance = totalDistance.toFixed(2);
            document.getElementById('badge-distance').innerHTML = totalDistance;
            document.getElementById('badge-distance-unit').innerHTML = "m";
        } else {
            // else if distance is above 1000m / 1km
            totalDistance /= 1000;
            // 3 decimal arround & display distance in kilometers
            totalDistance = totalDistance.toFixed(3);
            document.getElementById('badge-distance').innerHTML = totalDistance;
            document.getElementById('badge-distance-unit').innerHTML = "km";
        }

        document.getElementById("submitForm").addEventListener("click", removeLayers);

        function removeLayers() {
            map.removeLayers(latlngs)
            map.removeLayers(polyline);
            console.log("Layers successfully deleted");
        }
    });

    $('.datepicker').datepicker();

});