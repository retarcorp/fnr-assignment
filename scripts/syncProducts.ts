import pino from 'pino';
import 'dotenv/config';
import * as https from "https";
import { MongoClient } from 'mongodb';
import { randomUUID } from 'crypto';


const logger = pino({}, pino.destination('./sync/sync.log'));
logger.level = 'debug';

const targetHeaders = {
    vintage: 'Vintage',
    name: 'Product Name',
    producer: {
        name: 'Producer',
        country: 'Country',
        region: 'Region'
    }
}
let targetHeadersIndex = { vintage: -1, name: -1, producer: { name: -1, country: -1, region: -1 } };

const asyncTaskHeap = [];
const registerAsyncTask = () => {
    const uuid = randomUUID();
    asyncTaskHeap.push(uuid);
    return uuid;
}
const finishAsyncTask = (uuid) => {
    const index = asyncTaskHeap.indexOf(uuid);
    if (index !== -1) {
        asyncTaskHeap.splice(index, 1);
    }
}

const syncProductsToDb = async (products, dbClient: MongoClient) => {

    const result = await dbClient.db(process.env.DB_NAME).collection('products').bulkWrite(products.map((product) => ({
        updateOne: {
            filter: {
                name: product.name,
                vintage: product.vintage,
                producerId: product.producerId
            },
            update: {
                $set: {
                    name: product.name,
                    vintage: product.vintage,
                    producerId: product.producerId
                }
            },
            upsert: true
        }
    })));
    return result.insertedCount + result.modifiedCount + result.upsertedCount + result.matchedCount;
};

const proceedRowsBatch = async (rows, dbClient) => {
    
    const proceedBatchTask = registerAsyncTask();

    let products = rows.map((entry) => {
        let columns = entry.split(",");


        // let parsedProducer = {
        //     name: columns[targetHeadersIndex.producer.name],
        //     country: columns[targetHeadersIndex.producer.country],
        //     region: columns[targetHeadersIndex.producer.region],
        // };
        // const producerHash = `${parsedProducer.name}-${parsedProducer.country}-${parsedProducer.region}`;

        let product = {
            vintage: columns[targetHeadersIndex.vintage],
            name: columns[targetHeadersIndex.name],
            producerId: 0,
        };
        return product;
    });


    const result = await syncProductsToDb(products, dbClient);

    logger.info('Upserted products: ', result, 'async task id: ', proceedBatchTask);
    finishAsyncTask(proceedBatchTask);

}

const runSync = async (dbClient: MongoClient) => {

    const syncTask = registerAsyncTask();

    const url = process.env.PRODUCTS_URL;

    let data = "";
    let hangingData = "";
    let linesHandled = 0;
    let headers = null;


    const handleData = async (data, forceHandle = false) => {
        let rows = data.split("\n");
        let rowLength = rows.length;

        if (rowLength < 500 && forceHandle === false) {
            return data;
        }

        if (headers === null) {
            headers = rows.shift().split(",");
            targetHeadersIndex = {
                vintage: headers.indexOf(targetHeaders.vintage),
                name: headers.indexOf(targetHeaders.name),
                producer: {
                    name: headers.indexOf(targetHeaders.producer.name),
                    country: headers.indexOf(targetHeaders.producer.country),
                    region: headers.indexOf(targetHeaders.producer.region)
                }
            }

            logger.info("Headers found: " + headers);
        }

        proceedRowsBatch(rows, dbClient).then(() => {
            linesHandled += rowLength;
            logger.info(`Lines handled:  ${rowLength} of ${linesHandled}`);
        });

        return null;
    };

    const responseHandler = (res) => {
        const initMemory = process.memoryUsage();

        res.on("data", async (chunk) => {
            let rows = (hangingData + chunk).toString().split("\n");
            
            // In case if row reading was interrupted by chunk boundary
            hangingData = rows.pop();
            data = data + rows.join("\n");
            rows = null;
            data = await handleData(data);
        });

        res.on("end", () => {
            handleData(data, true);
            const finalMemory = process.memoryUsage();
            const diff = Object.keys(initMemory).reduce((acc, key) => {
                acc[key] = finalMemory[key] - initMemory[key];
                return acc;
            }, {});
            console.table([initMemory, finalMemory, diff]);

            finishAsyncTask(syncTask);
        });

        res.on("error", (err) => {
            logger.error("Error: " + err.message);
            
            finishAsyncTask(syncTask);
        });
    };

    logger.info('Syncing products...');
    https.get(url, responseHandler);


};

const main = async () => {
    const start = Date.now();
    const dbClient = new MongoClient(process.env.MONGODB_CONNECTION_STRING, {
        serverApi: {
            version: '1',
            strict: true,
            deprecationErrors: true,
        }
    });
    await dbClient.connect().catch((err: Error) => {
        logger.fatal('Failed to connect to MongoDB', err);
    });

    await runSync(dbClient);

    setInterval(async () => {

        if (asyncTaskHeap.length === 0) {
            logger.info('Sync job finished in: ' + (Date.now() - start) + 'ms');
            await dbClient.close();
            process.exit(0);
        }
    }, 100);
}

main();

