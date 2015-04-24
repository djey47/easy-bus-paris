define([   'backbone'],
function   (Backbone) {
    return Backbone.Model.extend({
            defaults: {
                position: {},
                removeStationType: [],
                address: "",
                relocate: false,
                isMapDisplayed: false
            }
        });
});
