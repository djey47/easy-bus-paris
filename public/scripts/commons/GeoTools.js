define([   'jquery'],
function ( $ ) {

    return {
        formatCoordinates : function (latitude, longitude) {
            var lat = this.formatCoordinate(latitude, true);
            var lng = this.formatCoordinate(longitude, false);
            return lat + "," + lng;
        },

        formatCoordinate : function (coord, isLatitude) {
            var degrees = ~~coord; // int part
            var cardinality = "";
            if (degrees > 0) {
                if (isLatitude) {
                    cardinality = "N";
                 } else {
                    cardinality = "E";
                 }
            } else if (degrees < 0) {
                if (isLatitude) {
                    cardinality = "S";
                 } else {
                    cardinality = "O";
                 }
            }
            degrees = Math.abs(degrees);
            coord = Math.abs(coord);

            var minutesRaw = (coord % 1) * 60;
            var minutes = ~~minutesRaw;
            var seconds = ~~((minutesRaw % 1) * 60);
            return cardinality + degrees + "°" + minutes + "'" + seconds + "\"";
        },

        getAddressFromCoordinates : function (latitude, longitude, callback) {
            var latlng = latitude + "," + longitude;
            $.get("http://maps.googleapis.com/maps/api/geocode/json?latlng=" + latlng + "&sensor=true", function (response) {
                if (response.results[0]) {
                    callback(response.results[0].formatted_address);
                } else {
                    callback("Adresse non disponible");
                }
            });
        },

        getCoordinatesFromAddress : function (address, okCallback, koCallback) {
            $.get("http://maps.googleapis.com/maps/api/geocode/json?address=" + address + "&sensor=true", function(response) {
                if (response.results[0]) {
                    okCallback(response.results[0].geometry.location.lng, response.results[0].geometry.location.lat);
                } else {
                    koCallback();
                }
            });
        }
    };
});