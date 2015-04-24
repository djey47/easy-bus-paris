define([ 'backbone', 'backboneSubviews', 'doT', 'gmaps', 'app/commons/GeoTools', 'app/commons/MapTools', 'app/models/StationsCollection', 'app/models/LineStationsCollection', 'app/models/POINearBusCollection', 'app/views/FilterStation', 'app/views/FilterPOI',   'app/views/StationList', 'app/views/POIList', 'app/views/AddressModal' ],
function (Backbone,   BackboneSubViews,   doT,   GMaps,   GeoTools,               MapTools,               StationsCollection,              LineStationsCollection,              POINearBusCollection,              FilterStationView,         FilterPOIView,           StationsCollectionView,  POICollectionView,   AddressModal) {
    var buildAndAddStationMarker = function(stationModel, currentView) {
        var icon;
        switch(stationModel.get("type")) {
            case "BUS":
                icon = 'public/img/bus/bus_tiny.png';
                break;
            case "VELIB":
                icon = 'public/img/velib/velib_tiny.png';
                break;
            case "AUTOLIB":
                icon = 'public/img/autolib/Autolib_tiny.png';
                icon = 'public/img/autolib/Autolib_tiny.png';
                break;
        }

        var position = stationModel.get("geo");
        var stationLatlng = new GMaps.LatLng(position[1], position[0]);
        var marker = new GMaps.Marker({
            position: stationLatlng,
            map: currentView.map,
            title: stationModel.get("name"),
            icon: icon
        });
        currentView.allStationMarkers.push(marker);

        // Calculates distance between station and me and updates model
        var myLatlng = new GMaps.LatLng(currentView.model.get("position").latitude, currentView.model.get("position").longitude);
        var distance = GMaps.geometry.spherical.computeDistanceBetween (myLatlng, stationLatlng).toFixed();
        stationModel.set("distance", distance);

        return marker;
    }

    var buildAndAddPOIMarker = function(poiModel, currentView) {
        var icon = "public/img/poi/marqueursunnybus_poi_" + poiModel.get("type") + ".png";
        var position = poiModel.get("geo");
        var poiLatlng = new GMaps.LatLng(position.lag, position.lng);
        var marker = new GMaps.Marker({
            position: poiLatlng,
            map: currentView.map,
            title: poiModel.get("name"),
            icon: icon
        });
        currentView.allPOIMarkers.push(marker);
        poiModel.set("mapMarker", marker);

        // Calculates distance between poi and me and updates model
        var myLatlng = new GMaps.LatLng(currentView.model.get("position").latitude, currentView.model.get("position").longitude);
        var distance = GMaps.geometry.spherical.computeDistanceBetween (myLatlng, poiLatlng).toFixed();
        poiModel.set("distance", distance);

        return marker;
    }

    var myView;

    return Backbone.View.extend({
        busSpot: doT.compile($("#spotBus").html()),
        velibSpot: doT.compile($("#spotVelib").html()),
        autolibSpot: doT.compile($("#spotAutolib").html()),
        poiSpot: doT.compile($("#spotPOITemplate").html()),
        myPosition: doT.compile($("#myPositionTemplate").html()),
        poiPane: doT.compile($("#poiPaneTemplate").html()),
        stationPane: doT.compile($("#stationPaneTemplate").html()),

        myPositionMarker: null,
        allStationMarkers: [],
        allPOIMarkers: [],

        events: {
            "click #stationPaneCloseButton" : "closeResults",
            "click #poiPaneCloseButton" : "closePOIResults"
        },

        subviewCreators: {
            "filterStation": function () {
                return new FilterStationView({model: this.model, statusBar: this.options.statusBar})
            },
            "stationSubview": function () {
                return new StationsCollectionView({collection: this.collection, model: this.model});
            },
            "filterPoi": function () {
                return new FilterPOIView({model: this.model, statusBar: this.options.statusBar})
            },
            "poiSubview": function () {
                return new POICollectionView({collection: this.poiCollection, model: this.model});
            }
        },

        initialize: function () {
            myView = this;

            // add backbone.subview functionality to this view
            Backbone.Subviews.add(this);

            this.collection = new StationsCollection();
            this.lineCollection = new LineStationsCollection();
            this.poiCollection = new POINearBusCollection();

            this.listenTo(this.model, "change:position", this.render);
            this.listenTo(this.model, "change:isMapDisplayed", this.resizeMap);
            this.listenTo(this.collection, "sync", this.renderStationMarkers);
            this.listenTo(this.lineCollection, "sync", this.renderLineStations);
            this.listenTo(this.poiCollection, "sync", this.renderLinePOIs);
            this.listenTo(Backbone, "stations:show", this.retrieveStationMarker);
            this.listenTo(Backbone, "poi:show", this.retrievePOIMarker);
            this.listenTo(this.model, "change:removeStationType", this.renderStationMarkers);
            this.listenTo(this.model, "change:removePOIType", this.renderPOIMarkers);

            //Out of view events
            $("#paneOpenButton").on("click", this.toggleResults);
            $("#backButton").on("click", this.home);
            $("#findMeButton").on("click", this.goToMyLocation);

            this.renderMap();
        },

        renderMap: function() {
            var mapOptions = {
                zoom: 18,
                mapTypeId: GMaps.MapTypeId.ROADMAP
            };
            this.map = new GMaps.Map(document.getElementById("sunnyMap"), mapOptions);
        },

        resizeMap: function() {
            GMaps.event.trigger(this.map, "resize");
        },

        render: function () {
            // (re)builds subviews placeholders
            $(this.el).html(this.stationPane() + this.poiPane());

            // Gets stations from server
            this.options.statusBar.set("searchMode", "STATION");
            this.options.statusBar.set("searching", true);
            var position = this.model.get("position");
            this.collection.fetch({data: position});

            // Creates marker
            var tmpl = this.myPosition({
                coordinates : GeoTools.formatCoordinates(position.latitude, position.longitude),
                address : this.model.toJSON().address
            });

            var mylatlng = new GMaps.LatLng(position.latitude, position.longitude);
            if (this.myPositionMarker) {
                this.myPositionMarker.setPosition(mylatlng);
                this.myPositionMarker.infoWindow.setContent(tmpl);
            } else {
                this.myPositionMarker = new GMaps.Marker({
                    position: mylatlng,
                    map: this.map,
                    icon: 'public/img/marqueursunnybus.png'
                });
                this.myPositionMarker.infoWindow = new GMaps.InfoWindow({
                    content: tmpl
                });
                GMaps.event.addListener(myView.myPositionMarker, 'click', function() {
                    myView.showMyPositionBubble();
                });
            }

            this.showMyPositionBubble();
            // Links
            $(document).off('click', '#autoLocalize');
            $(document).on('click', '#autoLocalize', function() {
                myView.model.set("relocate",true);
                myView.model.set("relocate",false, {silent:true});
            });
            $(document).off('click', '#placeLocalize');
            $(document).on('click', '#placeLocalize', function() {
                var addressModalView = new AddressModal({el: "#addressModal", model: myView.model, statusBar: myView.options.statusBar});
                addressModalView.show();
            });

            // Center map on marker
            this.map.panTo(this.myPositionMarker.getPosition());

            // Opens info bubble by default
            this.myPositionMarker.infoWindow.open(this.map, this.myPositionMarker);

            return this;
        },

        renderLineStations: function() {
            $("#lineNumberForButton").html(this.model.get("currentBusLine"));
            $("#backButton").show();
            this.renderLineStationMarkers();

            this.options.statusBar.set("searching", false);
        },

        renderLinePOIs: function() {
            this.renderPOIMarkers();
            MapTools.zoomToFitMarkers(myView.allPOIMarkers, myView.map)
        },

        renderStationMarkers: function () {
            var filters = this.model.get("removeStationType");

            this.clearStationsMarkers();

            this.collection.each(function(station) {
                // Applies filter
                if (!_.contains(filters, station.get('type'))) {
                    var mapsMarker = buildAndAddStationMarker(station, myView);
                    GMaps.event.addListener(mapsMarker, 'click', function() {
                        myView.myPositionMarker.infoWindow.close();
                        myView.showStationBubble(station, myView.options.statusBar, mapsMarker);
                    });
                    station.set("mapMarker", mapsMarker);
                }
            });

            this.options.statusBar.set("searching", false);
        },

        renderLineStationMarkers: function () {
            this.clearStationsMarkers();

            this.lineCollection.each(function(station) {
                var mapsMarker = buildAndAddStationMarker(station, myView);
                GMaps.event.addListener(mapsMarker, 'click', function() {
                    myView.myPositionMarker.infoWindow.close();
                    myView.showStationBubble(station, myView.options.statusBar, mapsMarker);
                });
            });
        },

        renderPOIMarkers: function() {
            var filters = this.model.get("removePOIType");

            this.clearPOIMarkers();

            this.poiCollection.each(function(poi) {
                if (!_.contains(filters, poi.get('type'))) {
                    var mapsMarker = buildAndAddPOIMarker(poi, myView);
                    GMaps.event.addListener(mapsMarker, 'click', function() {
                        myView.myPositionMarker.infoWindow.close();
                        myView.showPOIBubble(poi, mapsMarker);
                    });
                }
            });

            this.options.statusBar.set("searching", false);
        },

        clearStationsMarkers: function() {
            $.each(this.allStationMarkers, function(index, elt) {
               elt.setMap(null);
            });
            this.allStationMarkers = [];
        },

        clearPOIMarkers: function() {
            $.each(this.allPOIMarkers, function(index, elt) {
               elt.setMap(null);
            });
            this.allPOIMarkers = [];
        },

        retrieveStationMarker: function(stationModel) {
            this.showStationBubble(stationModel, this.options.statusBar, stationModel.get("mapMarker"));
        },

        retrievePOIMarker: function(poiModel) {
            this.showPOIBubble(poiModel, poiModel.get("mapMarker"));
        },

        showMyPositionBubble: function() {
            myView.myPositionMarker.infoWindow.open(myView.map, myView.myPositionMarker);
        },

        showStationBubble: function (stationModel, statusBarModel, marker) {
            var tmpl;
            switch(stationModel.get("type")) {
                case "BUS":
                    tmpl = this.busSpot(stationModel.toJSON());
                    break;
                case "VELIB":
                    tmpl = this.velibSpot(stationModel.toJSON());
                    break;
                case "AUTOLIB":
                    tmpl = this.autolibSpot(stationModel.toJSON());
                    break;
            }

            // Closes current station and position bubbles
            this.myPositionMarker.infoWindow.close();
            if (this.currentMarker) {
                this.currentMarker.infoWindow.close();
            }
            this.currentMarker = marker;

            // No need to recreate existing info window
            if (!marker.infoWindow) {
                marker.infoWindow = new GMaps.InfoWindow({
                    content: tmpl
                });
            }
            marker.infoWindow.open(this.map, marker);

            // Links
            $(document).find("a[name=searchPOI]").each(function(index, link) {
                $(link).off("click");
                $(link).on("click",null,$(link).attr("data-line"),myView.retrieveStationsAndPOIs);
            });
        },

        showPOIBubble: function (poiModel, poiMarker) {
            // No need to recreate existing info window
            if (!poiMarker.infoWindow) {
                var tmpl = this.poiSpot(poiModel.toJSON());
                poiMarker.infoWindow = new GMaps.InfoWindow({
                    content: tmpl
                });
            }
            poiMarker.infoWindow.open(this.map, poiMarker);
        },

        retrieveStations: function() {
            var position = myView.model.get("position");
            myView.collection.fetch({
                data: {
                    latitude: position.latitude,
                    longitude: position.longitude
                }
            });
        },

        retrieveStationsAndPOIs: function(event) {
            myView.options.statusBar.set("searchMode", "STATION_POI");
            myView.options.statusBar.set("searching", true);

            var busLine = [event.data];
            // Stations
            myView.model.set("currentBusLine", event.data);
            myView.lineCollection.fetch({
                data: {lines: [event.data]},
                processData: true
            });
            // POIs
            myView.poiCollection.fetch({
                data: {lines: [event.data]},
                processData: true
            });

            $("#stationMagicPane").fadeOut();
        },

        closeResults: function(event) {
            $("#stationMagicPane").fadeOut();
        },

        closePOIResults: function(event) {
            $("#poiMagicPane").fadeOut();
        },

        toggleResults: function(event) {
            if (myView.isPOIMode()) {
                var paneElement = $("#poiMagicPane");
                paneElement.fadeToggle();
            } else {
                var paneElement = $("#stationMagicPane");
                paneElement.fadeIn();
            }
        },

        goToMyLocation: function() {
            myView.map.panTo(myView.myPositionMarker.getPosition());
        },

        home: function() {
            $("#backButton").hide();
            myView.model.set("currentBusLine", null);
            myView.closePOIResults();

            myView.clearPOIMarkers();
            myView.clearStationsMarkers();

            myView.render();
        },

        isPOIMode: function() {
            return myView.model.get("currentBusLine");
        }
    });
});