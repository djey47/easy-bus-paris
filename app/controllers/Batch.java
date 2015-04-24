package controllers;

import com.fasterxml.jackson.annotation.JsonProperty;
import jongo.JongoPlugins;
import models.GeoStation;
import models.Poi;
import models.bus.Line;
import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.collections.Predicate;
import org.apache.commons.lang.StringUtils;
import org.jongo.MongoCollection;
import org.jongo.marshall.jackson.oid.ObjectId;
import play.Logger;
import play.mvc.Controller;

import java.util.ArrayList;
import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: david
 * Date: 13/06/13
 * Time: 15:17
 * To change this template use File | Settings | File Templates.
 */
public class Batch extends Controller {



    // CODE UNIQUEMENT POUR FORMATER LES DONNES OPENDATA CVS AU FORMAT MONGODB POUR LA GEOLOCALISATION
    // (cf repertoire dump)

    public static class Station {
        @ObjectId
        public String _id;
        public Double stop_lat;
        public Double stop_lon;
    }

    public static void formatData() {

        MongoCollection data_bus = JongoPlugins.collection("data_bus");
        Iterable<Station> iterable = data_bus.find().as(Station.class);
        for (Station station : iterable) {
            Logger.info("Conversion de %s", station._id);
            data_bus.update("{_id: #}", new org.bson.types.ObjectId(station._id)).with("{$set: {geo: [#, #]}, $unset: {stop_lat : 1, stop_lon : 1}}", station.stop_lon, station.stop_lat);
        }
        data_bus.ensureIndex("{geo: \"2d\"}");

        MongoCollection data_bus_stops = JongoPlugins.collection("data_bus_stops");
        Iterable<Station> iterableStops = data_bus_stops.find().as(Station.class);
        for (Station arret : iterableStops) {
            Logger.info("Conversion de %s", arret._id);
            data_bus_stops.update("{_id: #}", new org.bson.types.ObjectId(arret._id)).with("{$set: {geo: [#, #]}, $unset: {stop_lat : 1, stop_lon : 1}}", arret.stop_lon, arret.stop_lat);
        }
        data_bus_stops.ensureIndex("{geo: \"2d\"}");

        renderJSON("{OK}");
    }

    public static class StationV {
        @ObjectId
        public String _id;
        public Double latitude;
        public Double longitude;
    }
    public static void formatVelib() {
        /*
        {
	"_id" : ObjectId("51af56966183dc9f3b9941d3"),
	"number" : 7022,
	"name" : "07022 - PONT DE L'ALMA",
	"address" : "3 AVENUE BOSQUET - 75007 PARIS",
	"latitude" : 48.86164049957625,
	"longitude" : 2.302250344175951
}

         */
        MongoCollection data_velib = JongoPlugins.collection("data_velib");

        Iterable<StationV> iterable = data_velib.find().as(StationV.class);
        for (StationV station : iterable) {
            Logger.info("Conversion de %s", station._id);
            data_velib.update("{_id: #}", new org.bson.types.ObjectId(station._id)).with("{$set: {geo: [#, #]}, $unset: {latitude : 1, longitude : 1}}", station.longitude, station.latitude);
        }
        data_velib.ensureIndex("{geo: \"2d\"}");
        renderJSON("{OK}");

    }


    public static void format1() {
        MongoCollection data_velib = JongoPlugins.collection("data_velib");
        MongoCollection newCollection = JongoPlugins.collection("geostations");
        Iterable<models.velib.Station> velibs = data_velib.find().as(models.velib.Station.class);

        for (models.velib.Station velib : velibs) {
            GeoStation station = new GeoStation();
            station.type = GeoStation.StationType.VELIB;
            station.geo = velib.geo;
            station.externalId = velib.number.toString();
            station.name = velib.name;

            newCollection.insert(station);
        }

    }


    public static void format2() {
        MongoCollection data_arret_de_bus = JongoPlugins.collection("data_bus_stops");
        MongoCollection newCollection = JongoPlugins.collection("geostations");

        for (models.bus.Station bus : data_arret_de_bus.find("{stop_network: 'bus'}").as(models.bus.Station.class)) {
            GeoStation station = new GeoStation();
            station.type = GeoStation.StationType.BUS;
            station.geo = bus.position;
            station.externalId = "" + bus.stopInternalId;
            station.name = bus.name;
            station.lines = computeLine(bus.stopInternalId);
            station.filteredLines = new ArrayList(CollectionUtils.select(station.lines, new Predicate() {
                @Override
                public boolean evaluate(Object o) {
                    GeoStation.BusLine l = (GeoStation.BusLine) o;
                    return !Line.IGNORED_LINES.contains(l.code);
                }
            }));
            // Stations without lines are ignored
            if(station.filteredLines.size() > 0) {
                newCollection.insert(station);
            }
        }
        renderJSON("{OK}");
    }

    private static List<GeoStation.BusLine> computeLine(long stopId) {
        List<GeoStation.BusLine> result = new ArrayList<GeoStation.BusLine>();
        MongoCollection ligne_de_bus = JongoPlugins.collection("data_bus_lines");
        Iterable<Line> lines = ligne_de_bus.find("{stop_int_id: #}", stopId).as(Line.class);
        for (Line line : lines) {
            line.setCodeAndName();
            GeoStation.BusLine tmp = new GeoStation.BusLine();
            tmp.code = line.code;
            tmp.externalId = "" + line.stopInternalId;
            tmp.name = line.name;
            result.add(tmp);
        }

        return result;
    }


    public static class StationAutolib {

        @ObjectId
        public String _id;
        @JsonProperty("identifiant_dsp")
        public String idDsp;
        @JsonProperty("identifiant_autolib")
        public String idAutolib;
        @JsonProperty("rue")
        public String rue;
        @JsonProperty("code_postal")
        public int cp;
        @JsonProperty("ville")
        public String ville;
        @JsonProperty("coordonnees")
        public String coordonnees;
        @JsonProperty("type_de_station")
        public String typeStationAutolib;
        @JsonProperty("etat_actuel")
        public String etat;
        @JsonProperty("emplacement")
        public String emplacement;
        @JsonProperty("bornes_de_charge_autolib")
        public int nbBornesChargeAutolib;
        @JsonProperty("bornes_de_charge_pour_vehicule_tiers")
        public int nbBornesChargeTiers;
    }

    public static void format3() {
        MongoCollection data_stations_autolib = JongoPlugins.collection("data_autolib");
        MongoCollection newCollection = JongoPlugins.collection("geostations");

        for (StationAutolib stationAutolib : data_stations_autolib.find("{etat_actuel: 'Ouverte'}").as(StationAutolib.class)) {
            GeoStation station = new GeoStation();
            station.type = GeoStation.StationType.AUTOLIB;
            station.geo = parseCoordonneesAutolib(stationAutolib.coordonnees);
            station.externalId = "" + stationAutolib.idDsp;
            station.name = stationAutolib.idAutolib;

            newCollection.insert(station);
        }
        renderJSON("{OK}");
    }

    // ('lat':'lon') -> [lon,lat]
    private static Double[] parseCoordonneesAutolib(String coordonnees) {
        Double[] coordinates = new Double[2];

        String withoutBraces = coordonnees.substring(1, coordonnees.length() - 1);
        String[] latLon = withoutBraces.split(":");

        // Removes single quotes
        String lat = latLon[0].substring(1, latLon[0].length() - 1);
        String lon = latLon[1].substring(1, latLon[1].length() - 1);

        coordinates[0] = Double.parseDouble(lon);
        coordinates[1] = Double.parseDouble(lat);

        return coordinates;
    }

    /*
    {
        "_id" : ObjectId("51c061aedf02583875c27d95"),
        "Titre" : "RIEN QUE DU BONHEUR",
        "Realisateur" : "DENIS PARENT",
        "Date_Debut_Evenement" : "29/05/2002",
        "Date_Fin_Evenement" : "29/05/2002",
        "Cadre" : "EXTERIEUR",
        "Lieu" : "RUE",
        "Adresse" : "DAGUERRE",
        "Arrondissement" : 75014,
        "Adresse_complete" : "RUE DAGUERRE 75014 Paris France"
}
     */
    public static class CinemaPoi {
        public String Titre;
        public String Realisateur;
        public String Adresse_complete;
    }
    public static void formatCinemaPoi() {
        MongoCollection data = JongoPlugins.collection("cinemaPoi");
        MongoCollection target = JongoPlugins.collection("POItoBeGeolocalized");

        Iterable<CinemaPoi> pois = data.find().as(CinemaPoi.class);
        for (CinemaPoi cine : pois) {
            Poi poi = new Poi();
            poi.fullAddress = cine.Adresse_complete;
            poi.name = String.format("Lieu de tournage de %s", getCapitalize(cine.Titre));
            poi.type = Poi.PoiType.LIEU_TOURNAGE;
            poi.description = String.format("Lieu de tournage pour des scènes du film %s de %s", getCapitalize(cine.Titre), getCapitalize(cine.Realisateur));
            target.insert(poi);
        }

        renderJSON("{OK}");
    }

    /*
    {
        "_id" : ObjectId("51cd6542f029b2a051bb1d9f"),
        "Nom site" : "Maison des Associations Du 16eme",
        "Adresse" : "16 Avenue Rene Boylesve",
        "CP" : 75016,
        "VILLE" : "PARIS",
        "Adresse complète" : "16 Avenue Rene Boylesve 75016 PARIS France"
    }
    */
    public static class HotspotPoi {
        @JsonProperty("Nom site")
        public String Nom;
        @JsonProperty("Adresse complète")
        public  String Adresse_complete;
    }
    public static void formatHotspotPoi() {
        MongoCollection data = JongoPlugins.collection("hotspotPoi");
        MongoCollection target = JongoPlugins.collection("POItoBeGeolocalized");

        Iterable<HotspotPoi> pois = data.find().as(HotspotPoi.class);
        for (HotspotPoi hotspot : pois) {
            Poi poi = new Poi();
            poi.fullAddress = hotspot.Adresse_complete;
            poi.name = hotspot.Nom;
            poi.type = Poi.PoiType.HOTSPOT_WIFI;
            poi.description = String.format("Hotspot WIFI public - 2h de surf offertes !");
            target.insert(poi);
        }

        renderJSON("{OK}");
    }


    private static String getCapitalize(final String word) {
        return StringUtils.capitalize(StringUtils.lowerCase(word));
    }
}