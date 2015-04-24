define (['backbone', 'doT', 'app/views/OnePOI'],
function (Backbone,   doT,   OnePOIView) {
    return Backbone.View.extend({
        template: doT.compile($("#poiCollectionTemplate").html()),
        templatePOI: doT.compile($("#poiTemplate").html()),

        initialize: function () {
            this.listenTo(this.collection, "sync", this.render);
            this.listenTo(this.model, "change:removePOIType", this.render);
        },

        render: function () {
            $(this.el).html(this.template(this.collection.toJSON()));
            var tbody = this.$('tbody');
            var that = this;
            this.collection.filterPOI(this.model.get("removePOIType")).each(function (poi) {
                var onePOI = new OnePOIView({model: poi, template: that.templatePOI}).render();
                tbody.append(onePOI.el);
            });
            return this;
        }
    });
});