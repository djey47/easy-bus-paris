define([  'backbone'],
function  (Backbone) {
    return Backbone.Model.extend({
        defaults: {
            searching: false,
            searchMode: ""
        }
    });
});