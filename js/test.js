$(document).ready(() => {

    $(function () {
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
    });

    let map = L.map('map-bloc').setView([47.25, -1.40], 9.5);

    L.tileLayer('https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}{r}.png', {
        attribution: '<a href="https://wikimediafoundation.org/wiki/Maps_Terms_of_Use">Wikimedia</a>',
        minZoom: 2,
        maxZoom: 15
    }).addTo(map);

});