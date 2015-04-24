define([   'backbone', 'doT', 'app/commons/GeoTools', 'app/views/AddressModal'],
function ( Backbone,   doT,   GeoTools,               AddressModal ) {
    var localizeMeView;

    return Backbone.View.extend({
        template: doT.compile($("#localizeMeTemplate").html()),

        className: "document-row",

        events: {
            "click #tryButton": "localize",
            "click #discoverButton": "discover"
        },

        initialize: function () {
            localizeMeView = this;

            this.listenTo(this.model, "change:inError", this.renderFailure);
            this.listenTo(this.model, "change:relocate", this.localize);

            this.render();
        },

        render: function () {
            $(this.el).html(this.template());
            return this;
        },

        renderFailure: function () {
            if (this.model.get("inError")) {
                this.model.set("inError", "false");

                var addressModalView = new AddressModal( {
                    el: "#addressModal",
                    model: this.model,
                    statusBar: this.options.statusBar
                });
                addressModalView.show();
            }
            return this;
        },

        localize: function (event) {
            this.options.statusBar.set("searchMode", "GPS");
            this.options.statusBar.set("searching", true);

            var localizeSucceed = function (position) {
                // At this step, welcome is not necessary anymore
                $('#pocWelcome').fadeOut();
                $('#stationsResult').fadeIn();

                localizeMeView.model.set("isMapDisplayed",true);

                GeoTools.getAddressFromCoordinates(position.coords.latitude, position.coords.longitude, function (address) {
                    localizeMeView.model.set("address", address);
                    localizeMeView.model.set("position", {latitude: position.coords.latitude, longitude: position.coords.longitude});
                    localizeMeView.options.statusBar.set("searching", false);
                });
            };
            var localizeError = function (error) {
                localizeMeView.model.set("inError", true);
                localizeMeView.options.statusBar.set("searching", false);
            };
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(localizeSucceed, localizeError, {enableHighAccuracy: true, timeout: 30000});
            } else {
                this.model.set("inError", true);
                localizeMeView.options.statusBar.set("searching", false);
            }
        },

        discover: function() {
            window.location.href="/discover";
        }
    });
});
