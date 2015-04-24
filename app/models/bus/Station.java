package models.bus;

/**
 * Created with IntelliJ IDEA.
 * User: david
 * Date: 05/06/13
 * Time: 16:50
 * To change this template use File | Settings | File Templates.
 */

import com.fasterxml.jackson.annotation.JsonProperty;
import jongo.JongoPlugins;
import org.jongo.MongoCollection;
import org.jongo.marshall.jackson.oid.ObjectId;
import play.Logger;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

@Deprecated
public class Station {
    private static final int MAX_ITEMS = 25;

    @ObjectId
    public String _id;
    @JsonProperty("stop_desc")
    public String description;
    @JsonProperty("stop_name")
    public String name;
    @JsonProperty("geo")
    public Double[] position;
    @JsonProperty("stop_id")
    public long stopId;
    @JsonProperty("stop_int_id")
    public long stopInternalId;
    @JsonProperty("stop_network")
    public String network;

    List<Line> lines;


    private static final MongoCollection collectionBusStops = JongoPlugins.collection("data_bus_stops");
    private static final MongoCollection collectionBusLines = JongoPlugins.collection("data_bus_lines");

    public static HashMap<String, List<Station>> nearFrom(double lon, double lat) {
        HashMap<String, List<Station>> stations = new HashMap<String, List<Station>>();
        Iterable<Station> stops = collectionBusStops.find("{geo: {$near: [#, #]}, stop_network: 'bus' }", lon, lat).limit(MAX_ITEMS).as(Station.class);

        for (Station stop : stops) {
            stop.lines = new ArrayList<Line>();
            Iterable<Line> lines = collectionBusLines.find("{stop_int_id: #}", stop.stopInternalId).as(Line.class);

            for (Line line : lines) {
                line.setCodeAndName();

                if (Line.IGNORED_LINES.contains(line.code)) {
                    Logger.info("Ligne %s ignoree (filtrage intra-muros)", line.code);
                } else {
                    stop.lines.add(line);
                }
            }

            if (stop.lines.size() > 0) {
                if( !stations.containsKey(stop.name) ) {
                    stations.put(stop.name, new ArrayList<Station>());
                }
                stations.get(stop.name).add(stop);
            } else {
                Logger.info("Arret (%s - %s) ignore (pas de ligne)", stop.stopInternalId, stop.name);
            }
        }

        return stations;
    }
}
