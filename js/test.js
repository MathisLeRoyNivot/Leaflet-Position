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