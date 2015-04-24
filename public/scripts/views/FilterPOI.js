define (['backbone', 'doT'],
function (Backbone,   doT) {
    return Backbone.View.extend({
        template: doT.compile($("#filterPOITemplate").html()),
        events: {
            "click li": "filterMe"
        },

        filterMe: function (event) {
            this.options.statusBar.set("searchMode", "POI");
            this.options.statusBar.set("searching", true);

            $(event.target).parent().toggleClass("active");
            event.preventDefault();
            var filters = $(this.el).find("li:not(.active)").map(function (index, elt) {
                return $(elt).attr("data-value");
            }).get();
            this.model.set("removePOIType", filters);
        },

        render: function () {
            $(this.el).html(this.template());

            // Re-sets filters state
            var filter = this.model.get("removePOIType");
            _.each(filter, function(item) {
                var elt = $("#poiFilter ul").find("li[data-value=" + item + "]");
                elt.toggleClass("active");
            });

            return this;
        }
    });
});