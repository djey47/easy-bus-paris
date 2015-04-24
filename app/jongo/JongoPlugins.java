package jongo;

import com.mongodb.DB;
import com.mongodb.Mongo;
import org.apache.commons.lang.StringUtils;
import org.jongo.Jongo;
import org.jongo.MongoCollection;
import org.jongo.marshall.jackson.JacksonMapper;
import play.Logger;
import play.Play;
import play.PlayPlugin;
import play.exceptions.UnexpectedException;

import java.net.UnknownHostException;

/**
 * User: Wursteisen David
 * Date: 04/07/12
 * Time: 22:52
 */
public class JongoPlugins extends PlayPlugin {

    private static Jongo jongo;
    private static Mongo mongo;

    public static MongoCollection collection(String collectionName) {
        return jongo.getCollection(collectionName);
    }

    @Override
    public void onApplicationStart() {

        int mongoPort = Integer.parseInt(Play.configuration.getProperty("jongo.port"));
        String mongoHost = Play.configuration.getProperty("jongo.hostname");
        String dbName = Play.configuration.getProperty("jongo.dbname");
        String user = Play.configuration.getProperty("jongo.user");
        String password = Play.configuration.getProperty("jongo.password");

        try {

            Logger.info("Ouverture de la connexion au serveur mongodb %s:%s", mongoHost, mongoPort);
            mongo = new Mongo(mongoHost, mongoPort);

            DB mongoDB = mongo.getDB(dbName);
            if (StringUtils.isNotBlank(user)) {
                boolean authenticate = mongoDB.authenticate(user, password.toCharArray());
                Logger.info("Authentification au niveau du serveur mongodb %s:%s : %b", mongoHost, mongoPort, authenticate);
            }
            jongo = new Jongo(mongoDB, new JacksonMapper.Builder().build());
        } catch (UnknownHostException e) {
            jongo = null;
            mongo = null;
            throw new UnexpectedException("Oups ! Doesn't success to connect to the mongoDB instance", e);
        }
        Logger.info("Succefully connected to mongoDB instance %s:%s", mongoHost, mongoPort);
    }

    @Override
    public void onApplicationStop() {
        if (mongo != null) {
            mongo.close();
        }
    }
}
