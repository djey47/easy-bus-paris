define([ 'backbone', 'backboneSubviews', 'doT', 'gmaps', 'app/commons/GeoTools', 'app/commons/MapTools', 'app/models/POINearMeCollection', 'app/views/FilterPOI', 'app/views/POIList'],
function (Backbone,   BackboneSubViews,   doT,   GMaps,   GeoTools,               MapTools,               POINearMeCollection,              FilterPOIView,         POICollectionView) {
    var GEOLOC_DELAY = 10000;
    var myView;

    var buildPOIMarker = function(map, model) {
        var position = model.get("geo");
        var myLatlng = new GMaps.LatLng(position.lag, position.lng);
        var iconFile = "public/img/poi/marqueursunnybus_poi_" + model.get("type") + ".png";
        var marker = new GMaps.Marker({
            position: myLatlng,
            map: map,
            title: model.get("name"),
            icon: iconFile
        });
        return marker;
    };

    return Backbone.View.extend({
        poiSpot: doT.compile($("#spotPOITemplate").html()),
        myPosition: doT.compile($("#myPositionTemplate").html()),
        poiPane: doT.compile($("#poiPaneTemplate").html()),
        allPOIMarkers: [],
        isFirstTimeLocation: true,

        events: {
            "click #poiPaneCloseButton": "closeResults"
        },

        subviewCreators: {
            "filterPoi": function () {
                return new FilterPOIView({model: this.model, statusBar: this.options.statusBar})
            },
            "poiSubview": function () {
                return new POICollectionView({collection: this.collection, model: this.model});
            }
        },

        initialize: function () {
            myView = this;

            // add backbone.subview functionality to this view
            Backbone.Subviews.add(this);

            this.options.statusBar.set("searching", false);

            this.collection = new POINearMeCollection();

            this.listenTo(this.model, "change:position", this.render);
            this.listenTo(this.collection, "sync", this.renderPOI);
            this.listenTo(Backbone, "poi:show", this.retrievePOIMarker);
            this.listenTo(this.model, "change:removePOIType", this.renderPOI);

            // Out-of-view events
            $("#poiPaneOpenButton").on("click", this.toggleResults);
            $("#findMeButton").on("click", this.goToMyLocation);

            this.renderMap();
        },

        render: function() {
            // (re)builds subviews placeholders
            $(this.el).html(this.poiPane());

            // Gets POIs from server
            var position = this.model.get("position");
            this.collection.fetch({data: position});

            // Gets current address and creates/moves marker
            GeoTools.getAddressFromCoordinates(position.latitude, position.longitude, function (address) {
                position.address = address;
                var tmpl = myView.myPosition({
                    coordinates : GeoTools.formatCoordinates(position.latitude, position.longitude),
                    address : address
                });

                var mylatlng = new GMaps.LatLng(position.latitude, position.longitude);
                if (myView.myPositionMarker) {
                    myView.myPositionMarker.setPosition(mylatlng);
                    myView.myPositionMarker.infoWindow.setContent(tmpl);
                } else {
                    myView.myPositionMarker = new GMaps.Marker({
                        position: mylatlng,
                        map: myView.map,
                        icon: 'public/img/marqueursunnybus.png'
                    });
                    myView.myPositionMarker.infoWindow = new GMaps.InfoWindow({
                        content: tmpl
                    });
                    GMaps.event.addListener(myView.myPositionMarker, 'click', function() {
                        myView.myPositionMarker.infoWindow.open(myView.map, myView.myPositionMarker);
                    });

                    if (myView.isFirstTimeLocation) {
                        myView.goToMyLocation();
                        myView.isFirstTimeLocation = false;
                    }
                }
            });

            return this;
        },

        renderPOI: function() {
            var filters = this.model.get("removePOIType");

            this.clearPOIMarkers();

            // Adds new POI as markers
            this.collection.each(function(poi) {
                // Applies filter
                if (!_.contains(filters, poi.get('type'))) {
                    // Calculates distance between POIs and me and updates model
                    var myLatlng = new GMaps.LatLng(myView.model.get("position").latitude, myView.model.get("position").longitude);
                    var poiLatlng = new GMaps.LatLng(poi.get("geo").lag, poi.get("geo").lng);
                    var distance = GMaps.geometry.spherical.computeDistanceBetween (myLatlng, poiLatlng).toFixed();
                    poi.set("distance", distance);

                    // Creates map marker
                    var mapsMarker = buildPOIMarker(myView.map, poi);
                    var tmpl = myView.poiSpot(poi.toJSON());
                    mapsMarker.infoWindow = new GMaps.InfoWindow({
                        content: tmpl
                    });
                    GMaps.event.addListener(mapsMarker, 'click', function() {
                        myView.showPOIBubble(mapsMarker);
                    });
                    myView.allPOIMarkers.push(mapsMarker);
                    poi.set("mapMarker", mapsMarker);
                }
            });

            if (myView.isFirstTimeLocation) {
                MapTools.zoomToFitMarkers(myView.allPOIMarkers, myView.map);
            }

            return this;
        },

        clearPOIMarkers: function() {
            $.each(myView.allPOIMarkers, function(index, elt) {
               elt.setMap(null);
            });
            myView.allPOIMarkers = [];
        },

        renderMap: function () {
            // Initial position given ?
            var iniLat = $("#iniLat").val();
            var iniLon = $("#iniLon").val();

            if (iniLat == 0.0 && iniLon == 0.0) {
                iniLat = 48.858278;
                iniLon = 2.294254;
                var isDefaultLocation = true;
            }

            var mapOptions = {
                center: new GMaps.LatLng(iniLat,iniLon),
                zoom: 18,
                mapTypeId: GMaps.MapTypeId.ROADMAP
            };
            this.map = new GMaps.Map(document.getElementById("sunnyMap"), mapOptions);

            if (!isDefaultLocation) {
                this.model.set("position", {latitude: iniLat, longitude: iniLon});
            }

            // Go! Updates position every 15 seconds
            this.getLocation();
            setInterval(this.getLocation, GEOLOC_DELAY);

            return this;
        },

        getLocation: function() {
            myView.options.statusBar.set("searching", false);
            myView.options.statusBar.set("searchMode", "GPS");
            myView.options.statusBar.set("searching", true);

            var geoSuccess = function(position) {
                myView.options.statusBar.set("searching", false);
                myView.options.statusBar.set("searchMode", "DISCOVER");
                myView.options.statusBar.set("searching", true);

                var previousLocation = myView.model.get("position");
                var currentLocation = position.coords;

                if (previousLocation.latitude != currentLocation.latitude || previousLocation.longitude != currentLocation.longitude) {
                    myView.model.set("position", {latitude: currentLocation.latitude, longitude: currentLocation.longitude});
                }
            };

            var geoFail = function(error) {};

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(geoSuccess, geoFail, {enableHighAccuracy: true, timeout: GEOLOC_DELAY});
            }
        },

        closeResults: function(event) {
            $("#poiMagicPane").fadeOut();
        },

        toggleResults: function(event) {
            var paneElement = $("#poiMagicPane");
            if ( paneElement.is(":visible") ) {
                paneElement.fadeOut();
            } else if (myView.collection.length > 0) {
                paneElement.fadeIn();
            }
        },

        retrievePOIMarker: function(poiModel) {
            this.showPOIBubble(poiModel.get("mapMarker"));
        },

        goToMyLocation: function() {
            if (myView.myPositionMarker) {
                myView.map.panTo(myView.myPositionMarker.getPosition());
            }
        },

        showPOIBubble: function(poiMarker) {
            myView.myPositionMarker.infoWindow.close();
            poiMarker.infoWindow.open(myView.map, poiMarker);
        }
    });
});
