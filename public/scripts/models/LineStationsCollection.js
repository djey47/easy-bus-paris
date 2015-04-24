define([ 'backbone', 'app/models/Station'],
function (Backbone,   StationModel) {
    return Backbone.Collection.extend({
        model: StationModel,
        url: "busStations.json"
    });
});