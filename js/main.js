// let longitude = 51.5;
// let lattitude = -0.09;

// let longitude1 = 51.51;
// let lattitude1 = -0.1;




// L.marker([longitude, lattitude]).addTo(map)
//     .bindPopup(`Position 1.<br> Lng. ${longitude} & Lat. ${lattitude}.`)
//     .openPopup();


// L.marker([longitude1, lattitude1]).addTo(map)
//     .bindPopup(`Position 2.<br> Lng. ${longitude1} & Lat. ${lattitude1}.`)
//     .openPopup();

// Onload, execute the following code
$(document).ready(() => {

    let map = L.map('map-bloc').setView([46.2, 2.2], 6);

    L.tileLayer('https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}{r}.png', {
        attribution: '<a href="https://wikimediafoundation.org/wiki/Maps_Terms_of_Use">Wikimedia</a>',
        minZoom: 2,
        maxZoom: 15
    }).addTo(map);

    $.getJSON("http://127.0.0.1:5500/js/gps-coord.json", function (json) {
        
        for (var key in json) {
            if (json.hasOwnProperty(key)) {

                let id = json[key].id;
                let lattitude = json[key].lattitude;
                let longitude = json[key].longitude;
                let description = json[key].description;

                L.marker([lattitude, longitude]).addTo(map)
                    .bindPopup(`Position ${id}.<br> Lng. ${longitude} & Lat. ${lattitude}.<br>Lieux : ${description}`)
                    // .openPopup();            
            }
        }

        console.log(json); // this will show the info it in firebug console
    });
    
})