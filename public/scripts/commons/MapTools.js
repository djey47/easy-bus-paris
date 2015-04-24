define ([  'jquery', 'gmaps'],
function ( $,        GMaps) {

    return {
        zoomToFitMarkers : function (markers, map) {
            if (markers.length > 0) {
                var bounds = new GMaps.LatLngBounds ();
                $.each(markers, function(index, marker) {
                    bounds.extend (marker.getPosition());
                });
                map.fitBounds (bounds);
            }
        }
    };
});