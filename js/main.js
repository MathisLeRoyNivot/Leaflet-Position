// Date time picker
const dtpStart = $('#datetimepicker-start');
const dtpEnd = $('#datetimepicker-end');

const inputDtpStart = $('#start-date');
const inputDtpEnd = $('#end-date');

dtpStart.datetimepicker({
    format: 'YYYY-MM-DD HH:mm:ss',
    locale: 'fr',
    useCurrent: true
});
dtpEnd.datetimepicker({
    format: 'YYYY-MM-DD HH:mm:ss',
    locale: 'fr',
    useCurrent: false
});

// Initialize leaflet map
let map = L.map('map-bloc').setView([47.25, -1.40], 9.5);
let markerGroup = L.layerGroup().addTo(map);
let markerGroupFiltered = L.layerGroup().addTo(map);

const customIcon = L.icon({
    iconUrl: '/leaflet/images/marker-icon.png',
    shadowUrl: '/leaflet/images/marker-shadow.png',
    iconSize:     [25, 41],
    iconAnchor:   [12, 41], 
    shadowSize: [41, 41],
    popupAnchor:  [1, -34]
});

const customIconFiltered = L.icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    shadowSize: [41, 41],
    popupAnchor: [1, -34]
});

// Onload, execute the following code
$(document).ready(() => {

    inputDtpStart.val('');
    inputDtpEnd.val('');
    
    dtpStart.on("dp.change", function (e) {
        dtpEnd.data("DateTimePicker").minDate(e.date);
    });
    dtpEnd.on("dp.change", function (e) {
        dtpStart.data("DateTimePicker").maxDate(e.date);
    });

    // Leaflet Map
    // let markerGroup = L.layerGroup().addTo(map);
    // let markerGroupFiltered = L.layerGroup().addTo(map);

    L.tileLayer('https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}{r}.png', {
        attribution: '<a href="https://wikimediafoundation.org/wiki/Maps_Terms_of_Use">Wikimedia</a>',
        minZoom: 2,
        maxZoom: 15
    }).addTo(map);
    
    $.getJSON(`http://localhost:3000/api/coords`, function (json) {

        let latLngs = Array();
           
        for (let key in json) {
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
            } else {
                console.error("Erreur lors du chargement des données");
            }
        }

        console.debug(markerGroup);
        
        let polyline = L.polyline(latLngs, {
            color: 'blue'
        }).addTo(markerGroup);

        L.polylineDecorator(polyline, {
            patterns: [
                {
                    offset: 0, 
                    repeat: 75, 
                    symbolOffset: 10, 
                    symbol: L.Symbol.arrowHead({
                        polygon: false,
                        headAngle: 45,
                        pixelSize: 15,
                        pathOptions: {
                            opacity: 1, 
                            weight: 2, 
                            stroke: true, 
                            color:'#000000'
                        }
                    })
                }
            ]
        }).addTo(markerGroup);

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
            
            let isValid = true;
            
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
                let startDate = dtpStart.data("DateTimePicker").date();
                let endDate = dtpEnd.data("DateTimePicker").date();

                console.log("Start date : " + startDate + "\nEnd date : " + endDate);

                let filteredByDateMarkers = [];
                let fromTime = new Date(startDate).getTime();
                let toTime = new Date(endDate).getTime();
                    
                let row; 
                let date;

                for (let row in json) {
                    if (json.hasOwnProperty(row)) {
                        let rowData = json[row];
                        let dateTime = json[row].datetime;
                        date = new Date(dateTime);
                        if (date.getTime() >= fromTime && date.getTime() <= toTime) {
                            filteredByDateMarkers.push(rowData);
                        }
                    }
                }

                // for (i in json) {
                //     row = json[i];
                //     date = new Date(row.datetime);
                //     if (date.getTime() >= fromTime && date.getTime() <= toTime) {
                //         filteredByDateMarkers.push(row);
                //     }
                // }

                console.debug("No. of markers filtered by date returned : " + filteredByDateMarkers.length);
                console.debug(filteredByDateMarkers);
                const results = document.querySelector("#form-results"); // debugging

                if(filteredByDateMarkers.length === 0) {
                    results.innerHTML = "Aucun marqueur à afficher. Essayez avec de nouvelles dates."
                } else {
                    // results.innerHTML = JSON.stringify(filteredByDateMarkers); // debugging
                    results.innerHTML = filteredByDateMarkers.length + " position(s) trouvée(s)"; // debugging

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
                        
                        // /!\ code to fix /!\
                        // L.polylineDecorator(polylineFiltered, {
                        //     patterns: [
                        //         {
                        //             offset: 0, 
                        //             repeat: 75, 
                        //             symbolOffset: 10, 
                        //             symbol: L.Symbol.arrowHead({
                        //                 polygon: false,
                        //                 headAngle: 45,
                        //                 pixelSize: 15,
                        //                 pathOptions: {
                        //                     opacity: 1, 
                        //                     weight: 2, 
                        //                     stroke: true, 
                        //                     color:'#000000'
                        //                 }
                        //             })
                        //         }
                        //     ]
                        // }).addTo(markerGroupFiltered);

                    
                        let totalDistanceFiltered = 0;

                        for (let i = 0; i < latLngsFiltered.length - 1; i++) {
                            totalDistanceFiltered += L.latLng(latLngsFiltered[i]).distanceTo(latLngsFiltered[i + 1]);
                        }

                        function resultFormat() {
                            if(totalDistanceFiltered < 1000) {
                                totalDistanceFiltered = totalDistanceFiltered.toFixed(2);
                                document.getElementById('badge-distance').innerHTML = totalDistanceFiltered;
                                document.getElementById('badge-distance-unit').innerHTML = "m";
                            } else {
                                totalDistanceFiltered /= 1000;
                                totalDistanceFiltered = totalDistanceFiltered.toFixed(3);
                                document.getElementById('badge-distance').innerHTML = totalDistanceFiltered;
                                document.getElementById('badge-distance-unit').innerHTML = "km";
                            }
                        }
                        resultFormat();
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

    });
});

function removeLayers() {
    markerGroup.clearLayers();  
    markerGroupFiltered.clearLayers();
}

// Reset button
$("#resetBtn").click(function() {
    window.location.reload();
    inputDtpStart.val('');
    inputDtpEnd.val('');
});