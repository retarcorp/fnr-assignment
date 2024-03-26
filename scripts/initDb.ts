import { MongoClient, ServerApiVersion } from "mongodb";
import * as producersMock from '../mock/producers.js';
import 'dotenv/config'

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
            console.error('Failed to connect to MongoDB', err);
        });

    const db = client.db(process.env.DB_NAME);
    await db.dropCollection('products');
    const products = db.createCollection('products');

    await db.dropCollection('producers');
    const producers = db.collection('producers');

    const prodcersData = await producers.insertMany(producersMock);
    console.log('Producers inserted:', prodcersData.insertedCount);

    await client.close();
}

main()