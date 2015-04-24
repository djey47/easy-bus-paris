package models.velib;

import jongo.JongoPlugins;
import org.jongo.MongoCollection;
import org.jongo.marshall.jackson.oid.ObjectId;

/**
 * Created with IntelliJ IDEA.
 * User: david
 * Date: 05/06/13
 * Time: 17:25
 * To change this template use File | Settings | File Templates.
 */
@Deprecated
public class Station {

            /*
      {
	"_id" : ObjectId("51af57de6183dc9f3b994c6d"),
	"address" : "43 AVENUE RAPP - 75007 PARIS",
	"geo" : [
		2.300528330043888,
		48.8581690434843
	],
	"name" : "07024 - AVENUE RAPP",
	"number" : 7024
}


         */
    private static final int MAX_ITEMS = 25;

    @ObjectId
    public String _id;
    public Integer number;
    public String name;
    public String address;
    public Double[] geo;

    private static final MongoCollection collection = JongoPlugins.collection("data_velib");

    public static Iterable<Station> nearFrom(double lon, double lat) {
        //  db.data_bus.find({geo: {$near:[2.2537415598241908, 48.887111564357454]}}).limit(1)
        // FIXME: le $maxDistance via cette requête est en radiant
        // FIXME: changer le format de la requête pour utiliser le geometry avec type point ?
        // FIXME: cf http://docs.mongodb.org/manual/reference/operator/near/
        return collection.find("{geo: {$near: [#, #]}}", lon, lat).limit(MAX_ITEMS).as(Station.class);
    }
}
