define(['backbone', 'app/commons/GeoTools', 'bootstrap'],
function (Backbone,  GeoTools) {
    var myModal;

    return Backbone.View.extend({
        events: {
            "click #trySafeButton": "localizeByAddress"
        },

        initialize: function() {
            myModal = this;
            $("#addressModal").on("shown.bs.modal", function () {
                $("#addressSearch").focus();
            });
        },

        show: function(){
            $(this.el).modal("show");
        },

        localizeByAddress: function () {
            var address =  $("#addressSearch").val();
            if (address == "") {
                $("#addressSearch").focus();
                return;
            }
            this.model.set("address", address );

            this.options.statusBar.set("searchMode", "ADDRESS");
            this.options.statusBar.set("searching", true);
            GeoTools.getCoordinatesFromAddress(this.model.get("address"), this.coordSuccess, this.coordFail);
        },

        coordSuccess: function(longitude, latitude) {
            myModal.model.set("position", {latitude: latitude, longitude: longitude});
            myModal.options.statusBar.set("searching", false);

            // At this step, welcome is not necessary anymore
            $(".alert").alert("close")
            $("#addressModal").modal("hide");
            $('#pocWelcome').fadeOut();
            $('#stationsResult').fadeIn();
        },

        coordFail: function() {
            myModal.warning("Le lieu saisi est inconnu !");
            $("#addressSearch").focus();
        },

        warning: function(message) {
            $("#alertPlaceholder").html("<div class='alert in fade'><a class='close' data-dismiss='alert' href='#'>&times;</a><span>" + message + "</span></div>");
            $(".alert").alert();
        }
    });
});