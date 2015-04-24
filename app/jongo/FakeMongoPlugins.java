package jongo;

import de.flapdoodle.embed.mongo.MongodProcess;
import de.flapdoodle.embed.mongo.MongodStarter;
import de.flapdoodle.embed.mongo.config.MongodConfig;
import de.flapdoodle.embed.mongo.distribution.Version;
import de.flapdoodle.embed.process.runtime.Network;
import play.Logger;
import play.Play;
import play.PlayPlugin;

import java.io.IOException;
import java.net.UnknownHostException;

/**
 * Created with IntelliJ IDEA.
 * User: david
 * Date: 10/01/13
 * Time: 22:04
 * To change this template use File | Settings | File Templates.
 */
public class FakeMongoPlugins extends PlayPlugin {

    private static final String MONGO_ADRESSE = "localhost";
    private MongodProcess mongod;

    @Override
    public void onApplicationStart() {
        if (!Play.configuration.getProperty("jongo.fake", "false").equals("true")) {
            mongod = null;
            return;
        }

        Logger.warn("=========================================================================");
        Logger.warn("        VOUS UTILISEZ ACTUELLEMENT UNE BASE DE DONNEES EN MEMOIRE");
        Logger.warn("=========================================================================");
        Logger.warn("FakeMongoPlugins en place : la connexion MongoDB va maintenant pointer sur %s", MONGO_ADRESSE);
        Play.configuration.setProperty("jongo.hostname", MONGO_ADRESSE);
        Play.configuration.setProperty("jongo.port", "12345");

        try {
            MongodConfig mongodConfig = new MongodConfig(Version.Main.V2_0, 12345, Network.localhostIsIPv6());

            MongodStarter runtime = MongodStarter.getDefaultInstance();
            mongod = runtime.prepare(mongodConfig).start();
        } catch (UnknownHostException e) {
            Logger.error("Shit happens ! Problème lors de la création de l'instance de test mongoDb. cf exception", e);
        } catch (IOException e) {
            Logger.error("Shit happens ! Problème lors de la création de l'instance de test mongoDb. cf exception", e);
        }

    }

    @Override
    public void onApplicationStop() {
        if (mongod != null) {
            mongod.stop();
        }
    }
}
