define(['backbone', 'app/models/Station', 'app/models/StationsCollection'],
function (Backbone,  StationModel,         StationsCollection) {
    return Backbone.Collection.extend({
        model: StationModel,
        url: 'nearMe.json',
        filterStation: function (criteriaToRemove) {
            return new Backbone.Collection(this.filter(function(station) {
                return !_.contains(criteriaToRemove, station.get('type'));
            }));
        }
    });
});