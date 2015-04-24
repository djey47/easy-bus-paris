define (['backbone', 'doT'],
function( Backbone, doT) {
    return Backbone.View.extend({
        template: doT.compile($("#filter").html()),
        events: {
            "click li": "filterMe"
        },

        filterMe: function (event) {
            this.options.statusBar.set("searchMode", "STATION");
            this.options.statusBar.set("searching", true);

            $(event.target).parent().toggleClass("active");
            event.preventDefault();
            var filters = $(this.el).find("li:not(.active)").map(function (index, elt) {
                return $(elt).attr("data-value");
            }).get();

            this.model.set("removeStationType", filters);
        },

        render: function () {
            $(this.el).html(this.template());

            // Re-sets filters state
            var filter = this.model.get("removeStationType");
            _.each(filter, function(item) {
                var elt = $("#stationFilter ul").find("li[data-value=" + item + "]");
                elt.toggleClass("active");
            });

            return this;
        }
    });
});
