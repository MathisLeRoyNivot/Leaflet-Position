// Onload, execute the following code
$(document).ready(() => {

    $('#datetimepicker-start').datetimepicker();
    $('#datetimepicker-end').datetimepicker({
        locale: 'fr',
        useCurrent: false //Important! See issue #1075

    });
    $("#datetimepicker-start").on("dp.change", function (e) {
        $('#datetimepicker-end').data("DateTimePicker").minDate(e.date);
    });
    $("#datetimepicker-end").on("dp.change", function (e) {
        $('#datetimepicker-start').data("DateTimePicker").maxDate(e.date);
    });

    let map = L.map('map-bloc').setView([47.25, -1.40], 9.5);
    let markerGroup = L.layerGroup().addTo(map);
    let markerGroupFiltered = L.layerGroup().addTo(map);

    let customIcon = L.icon({
        iconUrl: '../styles/leaflet/images/marker-icon.png',
        shadowUrl: '../styles/leaflet/images/marker-shadow.png',
    
        iconSize:     [25, 41], // size of the icon
        shadowSize:   [50, 64], // size of the shadow
        iconAnchor:   [12, 41], // point of the icon which will correspond to marker's location
        shadowSize: [41, 41],  // the same for the shadow
        popupAnchor:  [1, -34] // point from which the popup should open relative to the iconAnchor
    });

    L.tileLayer('https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}{r}.png', {
        attribution: '<a href="https://wikimediafoundation.org/wiki/Maps_Terms_of_Use">Wikimedia</a>',
        minZoom: 2,
        maxZoom: 15
    }).addTo(map);
    
    $.getJSON("http://127.0.0.1:5500/js/gps-coord.json", function (json) {

        let latLngs = Array();
           
        for (var key in json) {
            if (json.hasOwnProperty(key)) {

                let id = json[key].id;
                let lattitude = json[key].lattitude;
                let longitude = json[key].longitude;
                let dateTime = json[key].datetime;
                let description = json[key].description;

                L.marker([lattitude, longitude], {icon: customIcon})
                    .addTo(markerGroup)
                    // .addTo(map)
                    .bindPopup(`<strong>Position #${id}<br>Longitude : </strong> ${longitude} <strong> | Lattitude : </strong> ${lattitude}<br><strong>Lieux : </strong> ${description}<br><strong>Date : </strong> ${dateTime}`);
                    // .openPopup(); 

                const newMarker = [lattitude, longitude];
                // Push data collected in newMarker variable to the array
                latLngs.push(newMarker);
            }
        }

        console.log(markerGroup);
        
        let polyline = L.polyline(latLngs, {
            color: 'blue'
        }).addTo(markerGroup);
        // .addTo(map)


        // zoom the map to the polyline
        map.fitBounds(polyline.getBounds());

        // Total distance sum
        let totalDistance = 0;

        for (let i = 0; i < latLngs.length - 1; i++) {
            totalDistance += L.latLng(latLngs[i]).distanceTo(latLngs[i + 1]);
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



        function checkInputs() {
            
            var isValid = true;
            
            $('input').filter('[required]').each(function() {
                if ($(this).val() === '') {
                    $('#confirm').prop('disabled', true);
                    isValid = false;
                    return false;
                }
            });
            
            if(isValid) {
                $('#submitForm').prop('disabled', false);
            }
            return isValid;
        }
          
        
        $('#submitForm').click(function() {
            if(checkInputs()) {
                removeLayers();
                // Recover input element values
                let startDate = document.getElementById("start-date").value; 
                let endDate = document.getElementById("end-date").value; 

                console.log("Start date : " + startDate + "\nEnd date : " + endDate);

                let filteredByDateMarkers = [];
                let fromTime = new Date(startDate).getTime();
                let toTime = new Date(endDate).getTime();
                    
                let row; 
                let date;

                for (i in json) {

                    row = json[i];
                    date = new Date(row.datetime);

                    if (date.getTime() >= fromTime && date.getTime() <= toTime) {
                        filteredByDateMarkers.push(row);
                    }
                }

                console.log("No. of markers filtered by date returned : " + filteredByDateMarkers.length);
                console.log(filteredByDateMarkers);
                // var results = document.querySelector("#form-results"); // debugging

                if(filteredByDateMarkers.length === 0) {
                    results.innerHTML = "Aucun marqueur à afficher. Essayez avec de nouvelles dates."
                } else {
                    results.innerHTML = JSON.stringify(filteredByDateMarkers); // debugging

                    let customIconFiltered = L.icon({
                        iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
                        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                        iconSize: [25, 41], // size of the icon
                        shadowSize: [50, 64], // size of the shadow
                        iconAnchor: [12, 41], // point of the icon which will correspond to marker's location
                        shadowSize: [41, 41],  // the same for the shadow
                        popupAnchor: [1, -34] // point from which the popup should open relative to the iconAnchor
                    });

                    let latLngsFiltered = Array();

                    for (let key in  filteredByDateMarkers) {

                        let id = filteredByDateMarkers[key].id;
                        let lattitude = filteredByDateMarkers[key].lattitude;
                        let longitude = filteredByDateMarkers[key].longitude;
                        let dateTime = filteredByDateMarkers[key].datetime;
                        let description = filteredByDateMarkers[key].description;

                        L.marker([lattitude, longitude], {icon: customIconFiltered})
                            .addTo(markerGroupFiltered)
                            // .addTo(map)
                            .bindPopup(`<strong>Position #${id}<br>Longitude : </strong> ${longitude} <strong> | Lattitude : </strong> ${lattitude}<br><strong>Lieux : </strong> ${description}<br><strong>Date : </strong> ${dateTime}`);
                            // .openPopup(); 

                        const newMarkerFiltered = [lattitude, longitude];
                        // Push data collected in newMarker variable to the array
                        latLngsFiltered.push(newMarkerFiltered);
                        
                        let polylineFiltered = L.polyline(latLngsFiltered, {
                            color: 'red'
                        }).addTo(markerGroupFiltered);
                        // .addTo(map)
                    
                        let totalDistanceFiltered = 0;

                        for (let i = 0; i < latLngsFiltered.length - 1; i++) {
                            totalDistanceFiltered += L.latLng(latLngsFiltered[i]).distanceTo(latLngsFiltered[i + 1]);
                        }

                        // Distance format
                        // If distance is under 1000m / 1km
                        if(totalDistanceFiltered < 1000) {
                            // 2 decimal arround & display distance in meters
                            totalDistanceFiltered = totalDistanceFiltered.toFixed(2);
                            document.getElementById('badge-distance').innerHTML = totalDistanceFiltered;
                            document.getElementById('badge-distance-unit').innerHTML = "m";
                        } else {
                            // else if distance is above 1000m / 1km
                            totalDistanceFiltered /= 1000;
                            // 3 decimal arround & display distance in kilometers
                            totalDistanceFiltered = totalDistanceFiltered.toFixed(3);
                            document.getElementById('badge-distance').innerHTML = totalDistanceFiltered;
                            document.getElementById('badge-distance-unit').innerHTML = "km";
                        }
                    }
                }

            } else {
                console.error('Error');
            }
        });
          
        //Enable or disable button based on if inputs are filled or not
        $('input').filter('[required]').on('keyup',function() {
            checkInputs();
        })
        
        checkInputs()
        // document.getElementById("submitForm").addEventListener("click", removeLayers);

        function removeLayers() {
            // map.removeLayer(markerGroup);
            markerGroup.clearLayers();
            markerGroupFiltered.clearLayers();
            // clearGroup(map, markerGroup);
            // map.eachLayer(function (markerGroup) {
            //     map.removeLayer(markerGroup);
            // });
        }

    });
});