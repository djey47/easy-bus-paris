// convert Google Maps into an AMD module
define('gmaps', ['async!http://maps.google.com/maps/api/js?key=AIzaSyAeeGwOFDxRzA1jRIObawZvfApbqN94yB4&sensor=true&libraries=geometry'],
function(){
    // return the gmaps namespace for brevity
    return window.google.maps;
});