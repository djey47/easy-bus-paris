package models;

import jongo.JongoPlugins;
import org.jongo.MongoCollection;
import org.jongo.marshall.jackson.oid.ObjectId;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Created with IntelliJ IDEA.
 * User: david
 * Date: 13/06/13
 * Time: 15:20
 * To change this template use File | Settings | File Templates.
 */
public class GeoStation {

    @ObjectId
    public transient String _id;
    public String externalId;
    public String name;
    public Double[] geo;
    public StationType type;
    public transient List<BusLine> lines = new ArrayList<BusLine>();
    public List<BusLine> filteredLines = new ArrayList<BusLine>();

    public static class BusLine {
        public transient String externalId;
        public String code;
        public String name;
    }

    public static enum StationType {
          VELIB,
          BUS,
          AUTOLIB
    }

    private static final MongoCollection collection = JongoPlugins.collection("geostations");

    private static final int MAX_DISTANCE_IN_METER = 1000;

    public static Iterable<GeoStation> all() {
        return collection.find().as(GeoStation.class);
    }

    public static Iterable<GeoStation> nearFrom(double lon, double lat) {
        return collection.find("{geo: {$near: {type: 'Point', coordinates: [#, #]}, $maxDistance: #}}", lon, lat, MAX_DISTANCE_IN_METER).as(GeoStation.class);
    }

    public static Iterable<GeoStation> fromBusLine(String line) {
        return collection.find("{type: 'BUS' ,  filteredLines: {$elemMatch: {code: #} } }", line).as(GeoStation.class);
    }

    public static Set<GeoStation> fromBusLines(List<String> lines) {

        Set<GeoStation> allStations = new HashSet<GeoStation>();

        for(String line : lines) {

            for (GeoStation station : fromBusLine(line)) {
                allStations.add(station);
            }
        }

        return allStations;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        GeoStation that = (GeoStation) o;

        if (externalId != null ? !externalId.equals(that.externalId) : that.externalId != null) return false;

        return true;
    }

    @Override
    public int hashCode() {
        return externalId != null ? externalId.hashCode() : 0;
    }
}
