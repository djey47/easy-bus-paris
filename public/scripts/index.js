/* Dependency management */
requirejs.config({
    baseUrl: 'public/scripts/lib',
    paths: {
        app: '../'
    },
    shim: {
        underscore: {
            exports: '_'
        },
        backbone: {
            deps: ["underscore", "jquery"],
            exports: "Backbone"
        },
        backboneSubviews: {
            deps: ["backbone"]
        },
        bootstrap: {
            deps: ["jquery"]
        }
    }
});

// Start the main app logic.
requirejs(['jquery', 'backbone', 'underscore', 'app/commons/UITools', 'app/models/Localization', 'app/models/POI', 'app/models/Status', 'app/views/LocalizeMe', 'app/views/StatusBar', 'app/views/StationMap'],
function   ($,        Backbone,   _,            UITools,               LocalizeMeModel,           POIModel,         StatusModel,         LocalizeMe,             StatusBarView,         MapAndResultsView) {
    // View init
    var localizeModel = new LocalizeMeModel();
    var poiModel = new POIModel();
    var statusModel = new StatusModel();

    var localizeView = new LocalizeMe({el: "#localizeMe", model: localizeModel, statusBar: statusModel});
    var statusBarView = new StatusBarView({el: "#statusBar", model: statusModel});
    var mapsAndResultsView = new MapAndResultsView({el: "#magicPanes", model: localizeModel, statusBar: statusModel});

    // Hidden by default
    UITools.hideStatusBar();
});