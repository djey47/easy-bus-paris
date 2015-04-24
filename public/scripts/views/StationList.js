define([ 'backbone', 'doT', 'app/views/OneStation'],
function (Backbone,   doT,   OneStationView) {
    return Backbone.View.extend({
        template: doT.compile($("#stationsCollectionsTemplate").html()),
        templateBusStation: doT.compile($("#busStationTemplate").html()),
        templateVelibStation: doT.compile($("#velibStationTemplate").html()),
        templateAutolibStation: doT.compile($("#autolibStationTemplate").html()),

        initialize: function () {
            this.listenTo(this.collection, "sync", this.render);
            this.listenTo(this.model, "change:removeStationType", this.render);
        },

        render: function () {
            $(this.el).html(this.template(this.collection.toJSON()));
            // To fix control height
            $(this.el).addClass("stationsEmbedder");

            var tbody = this.$('tbody');
            var that = this;
            this.collection.filterStation(this.model.get("removeStationType")).each(function (station) {
                switch(station.get("type")) {
                    case "BUS":
                        var tmpl = that.templateBusStation;
                        break;
                    case "VELIB":
                        var tmpl = that.templateVelibStation;
                        break;
                    case "AUTOLIB":
                        var tmpl = that.templateAutolibStation;
                        break;
                }
                tbody.append(new OneStationView({model: station, template: tmpl}).render().el);
            });
            return this;
        }
    });
});