package jobs;

import jongo.JongoPlugins;
import models.GeoStation;

import models.Poi;
import org.apache.commons.lang.StringUtils;
import org.bson.types.ObjectId;
import org.jongo.MongoCollection;

import play.Logger;
import play.jobs.Every;
import play.jobs.Job;
import play.libs.WS;

import com.google.gson.JsonObject;

/**
 * Created with IntelliJ IDEA. User: david.wursteisen Date: 18/06/13 Time: 13:40 To change this template use File | Settings | File
 * Templates.
 */

//@Every("1min")
public class PoiIntegrator extends Job {

    private static final MongoCollection toBeGeolocalized = JongoPlugins.collection("POItoBeGeolocalized");
    private static final int STATIONS_PER_BATCH = 15;
    private static final String url = "http://maps.googleapis.com/maps/api/geocode/json?address=%s&sensor=true";

    @Override
    public void doJob() throws Exception {
        Iterable<Poi> stationsToBeGeolocalized = toBeGeolocalized.find().limit(STATIONS_PER_BATCH).as(Poi.class);
        for (Poi poi : stationsToBeGeolocalized) {
            if (StringUtils.isBlank(poi.fullAddress)) {
                continue;
            }

            Logger.info("Will integrate %s", poi);

            if (!isAlreadyGeoEncoded(poi)) {
                Logger.info("Will geolocalize %s", poi);
                String urlToCall = String.format(url, WS.encode(poi.fullAddress));
                WS.HttpResponse response = WS.url(urlToCall).get();
                JsonObject json = response.getJson().getAsJsonObject();
                if (!"OK".equals(json.get("status").getAsString())) {
                    Logger.warn("Oups ! Wrong status received from google. Won't encode %s", poi);
                    continue;
                }

                JsonObject geo = json.getAsJsonArray("results").get(0).getAsJsonObject().getAsJsonObject("geometry").getAsJsonObject("location");
                poi.geo = new Poi.Position(geo.get("lng").getAsDouble(), geo.get("lat").getAsDouble());
            }

            toBeGeolocalized.remove(new ObjectId(poi._id));
            poi._id = null;
            poi.insert();
        }
    }

    private boolean isAlreadyGeoEncoded(final Poi geoStation) {
        return (geoStation.geo != null);
    }
}
