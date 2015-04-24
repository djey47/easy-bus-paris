package models;

import jongo.JongoPlugins;
import org.jongo.MongoCollection;
import org.jongo.marshall.jackson.oid.ObjectId;

/**
 * Created with IntelliJ IDEA.
 * User: david.wursteisen
 * Date: 18/06/13
 * Time: 14:18
 * To change this template use File | Settings | File Templates.
 */
public class Poi {

    @ObjectId
    public String _id;
    public Position geo;
    public String fullAddress;
    public String name;
    public String description;
    public PoiType type;


    public static enum PoiType {
        MUSEE,
        LIEU_TOURNAGE,
        HOTSPOT_WIFI,
        AUTRE
    }

    public static class Position {
        public Double lng;
        public Double lag;

        public Position() {

        }
        public Position(final Double lng, final Double lat) {
            this.lng = lng;
            this.lag = lat;
        }
    }

    private static final MongoCollection collection = JongoPlugins.collection("poi");

    public void insert() {
        collection.insert(this);
    }

    private static final int MAX_DISTANCE_IN_METER = 250;
    public static Iterable<Poi> nearFrom(double lng, double lat) {
        return collection.find("{geo: {$near: {type: 'Point', coordinates: [#, #]}, $maxDistance: #}}", lng, lat, MAX_DISTANCE_IN_METER).as(Poi.class);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        Poi poi = (Poi) o;

        return _id.equals(poi._id);
    }

    @Override
    public int hashCode() {
        return _id.hashCode();
    }
}


