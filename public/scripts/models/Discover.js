define([ 'backbone'],
function (Backbone) {
    return Backbone.Model.extend({
                   defaults: {
                       position: {},
                       removePOIType: []
                   }
    });
});