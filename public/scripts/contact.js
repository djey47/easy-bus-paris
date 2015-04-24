/* Dependency management */
requirejs.config({
    baseUrl: 'public/scripts/lib',
    paths: {
        app: '../'
    },
    shim: {}
});

// Start the main app logic.
requirejs(['jquery', 'app/commons/UITools'],
function   ($,        UITools) {
    UITools.navSelect("itemContact");

    // Hidden by default
    UITools.hideStatusBar();
});