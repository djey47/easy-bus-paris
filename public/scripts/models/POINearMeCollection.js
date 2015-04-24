define(['backbone', 'app/models/POI'],
function( Backbone,  POIModel){
    return Backbone.Collection.extend({
        model: POIModel,
        url: 'poisNearMe.json',
        filterPOI: function (criteriaToRemove) {
            return new Backbone.Collection(this.filter(function(poi) {
                return !_.contains(criteriaToRemove, poi.get('type'));
            }));
        }
    });
});