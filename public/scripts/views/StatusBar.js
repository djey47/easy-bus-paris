define(['backbone', 'doT', 'app/commons/UITools'],
function(Backbone,   doT,   UITools) {
    return Backbone.View.extend({
        template: doT.compile($("#statusBarTemplate").html()),

        initialize: function () {
            this.listenTo(this.model, "change:searching", this.render);
        },

        render: function () {
            if (this.model.get("searching")) {
                switch(this.model.get("searchMode")) {
                    case "GPS":
                        $(this.el).html(this.template({ statusText: "Recherche de votre position..." }));
                        UITools.showStatusBar();
                        break;
                    case "ADDRESS":
                        $(this.el).html(this.template({ statusText: "Recherche de l'adresse..." }));
                        UITools.showStatusBar();
                        break;
                    case "POI":
                        $(this.el).html(this.template({ statusText: "Recherche de points d'intérêt..." }));
                        UITools.showStatusBar();
                        break;
                    case "STATION":
                        $(this.el).html(this.template({ statusText: "Recherche de stations..." }));
                        UITools.showStatusBar();
                        break;
                    case "STATION_POI":
                        $(this.el).html(this.template({ statusText: "Recherche de points d'intérêt..." }));
                        UITools.showStatusBar();
                        break;
                    case "DISCOVER":
                        $(this.el).html(this.template({ statusText: "Sunny Discover est actif..." }));
                        UITools.showStatusBar();
                        break;
                }
            } else {
                this.model.set("searchMode","");

                $(this.el).html("");
                UITools.hideStatusBar();
            }
            return this;
        }
    });
});