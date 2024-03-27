import { MongoClient, ServerApiVersion } from "mongodb";
import * as producersMock from '../mock/producers.js';
import 'dotenv/config'
import logger from "../utils/logger.js";

const main = async () => {
    const client = new MongoClient(process.env.MONGODB_CONNECTION_STRING, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    });

    await client.connect()
        .catch((err: Error) => {
            logger.error(err, 'Failed to connect to MongoDB');
            process.exit(1);
        });

    const db = client.db(process.env.DB_NAME);
    await db.dropCollection('products');
    await  db.createCollection('products');
    const products = db.collection('products');

    await db.dropCollection('producers');
    await db.createCollection('producers');
    const producers = db.collection('producers');
    await producers.deleteMany({})

    const prodcersData = await producers.insertMany(producersMock);
    logger.info('Producers inserted:', prodcersData.insertedCount);

    const titles = [
        "Chateau Margaux",
        "Opus One",
        "Screaming Eagle",
        "Domaine de la Romanee-Conti",
        "Penfolds Grange",
        "Chateau d'Yquem",
        "Chateau Lafite Rothschild",
        "Sassicaia",
        "Vega Sicilia",
        "Caymus Vineyards Special Selection",
        "Chateau Latour",
        "Petrus",
        "Chateau Haut-Brion",
        "Ridge Monte Bello",
        "Harlan Estate",
        "Gaja Barbaresco",
        "Clos de Tart",
        "Dominus Estate",
        "Silver Oak",
        "Mouton Rothschild"
    ];

    const years = new Array(10).fill(0).map((_, i) => 2010 + i);

    const productsToInsert = years.flatMap((year) => {
        return titles.map((title) => {
            return {
                name: title + ' ' + year.toString(),
                producerId: prodcersData.insertedIds[Math.floor(Math.random() * prodcersData.insertedCount)].toString(),
                vintage: year.toString()
            }
        });
    });

    const productsData = await products.insertMany(productsToInsert);
    logger.info('Products inserted:', productsData.insertedCount);

    await client.close();
}

main()