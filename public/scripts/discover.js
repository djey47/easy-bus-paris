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
requirejs([ 'jquery', 'app/commons/UITools', 'app/models/Status', 'app/models/Discover', 'app/views/StatusBar', 'app/views/SunnyDiscover'],
function   ( $,        UITools,              StatusModel,          DiscoverModel,         StatusBarView,         SunnyDiscoverView) {
    UITools.navSelect("itemDiscover");

    // Hidden by default
    UITools.hideStatusBar();

    var statusModel = new StatusModel();
    var discoverModel = new DiscoverModel();

    var statusBarView = new StatusBarView({el: "#statusBar", model: statusModel});
    var discoverView = new SunnyDiscoverView({el: "#poiMagicPane", model: discoverModel, statusBar: statusModel});
});