package controllers;

import com.google.common.collect.Lists;
import models.GeoStation;
import models.Poi;
import play.Logger;
import play.mvc.Controller;

import java.util.*;

public class Application extends Controller {

    public static final double LAT_TOUR_EIFFEL = 48.858278;
    public static final double LON_TOUR_EIFFEL = 2.294254;

    public static void index() {
        render();
    }

    public static void nearMe(double latitude, double longitude) {
        Logger.info("Recherche de stations de bus a proximite de %f - %f", latitude, longitude);
        Iterable<GeoStation> stations = GeoStation.nearFrom(longitude, latitude);
        List<GeoStation> result = Lists.newArrayList(stations);
        renderJSON(result);
    }

    public static void poisNearMe(double latitude, double longitude) {
        Logger.info("Recherche des POI a proximite de %f - %f", latitude, longitude);
        List<Poi> result = getPois(latitude, longitude);
        renderJSON(result);
    }

    public static void poisNearBus(String[] lines) {
        Logger.info("Recherche des POI a proximite des lignes de BUS %s", Arrays.toString(lines));

        List<Poi> linePois = new ArrayList<Poi>();

        Iterable<GeoStation> linesStations = GeoStation.fromBusLines(Arrays.asList(lines));
        for (GeoStation lineStation : linesStations) {
            List<Poi> stationPois = getPois(lineStation.geo[1], lineStation.geo[0]);

            for (Poi stationPoi : stationPois) {

                if(!linePois.contains(stationPoi)) {
                    linePois.add(stationPoi);
                }
            }
        }

        renderJSON(linePois);
    }

    // TODO Use  List<String> as parameter instead (need to find parameter url syntax)
    public static void busStations(String[] lines) {
        Logger.info("Recherche des stations bus desservies par les lignes %s", Arrays.toString(lines));

        Set<GeoStation> stations;
        if (lines == null) {
            stations = new HashSet<GeoStation>();
        } else {
            stations = GeoStation.fromBusLines(Arrays.asList(lines));
        }

        renderJSON(stations);
    }

    public static void stationNames(String q, int limit) {
        Logger.info("Obtention de tous les noms de stations");

        Set<String> names = new HashSet<String>();
        Iterable<GeoStation> allStations = GeoStation.all();
        int count = 0;
        for (GeoStation geoStation : allStations) {
            if (count == limit) {
                break;
            }
            if (q == null || geoStation.name.toUpperCase().contains(q.toUpperCase())) {
                names.add(geoStation.name);
                count++;
            }
        }

        renderJSON(names);
    }

    public static void about() {
        render();
    }

    public static void contact() {
        render();
    }

    public static void discover(double latitude, double longitude ) {

        if (latitude == 0.0 && longitude == 0.0) {
            Logger.info("Activation du mode discover à partir de la position par défaut %f - %f", latitude, longitude);
        } else {
            Logger.info("Activation du mode discover à partir de la position %f - %f", latitude, longitude);
        }
        render(latitude, longitude);
    }

    private static List<Poi> getPois(double latitude, double longitude) {
        Iterable<Poi> pois = Poi.nearFrom(longitude, latitude);
        return Lists.newArrayList(pois);
    }
}