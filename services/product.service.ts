import { MongoClient, ObjectId } from "mongodb";
import { Producer, Product } from "../types";
import logger from "../utils/logger";
import { spawn } from "child_process";


export interface ProductService {
    getAllProducts(): Promise<Product[]>
    getById(id: string): Promise<Product | null>;
    getByProducerId(producerId: string): Promise<Product[]>;
    create(products: Omit<Product, '_id' | 'producer'>[]): Promise<Product[]>;
    update(_id: string, data: Partial<Product>): Promise<Product>;
    delete(_ids: string[]): Promise<boolean>;
    startSyncJob(): Promise<boolean>;
}

export class ProductServiceMongoDbImpl implements ProductService {

    private client: MongoClient;

    constructor(client: MongoClient) {
        this.client = client;
    }

    async getAllProducts(): Promise<Product[]> {
        const items = await this.client.db(process.env.DB_NAME).collection('products').find({}, {}).toArray();
        return Promise.all(items.map(item => this.productEntryToModel(item)));
    }

    async getById(id: string): Promise<Product | null> {
        const item = await this.client.db(process.env.DB_NAME).collection('products').findOne({
            _id: {
                $eq: new ObjectId(id)
            }
        }, {});
        return this.productEntryToModel(item);
    }

    async getByProducerId(producerId: string): Promise<Product[]> {
        const items = await this.client.db(process.env.DB_NAME).collection('products').find({
            producerId: {
                $eq: producerId
            }
        });
        const handled = await items.toArray();

        return Promise.all(handled.map(item => this.productEntryToModel(item)));
    }

    async create(products: Omit<Product, '_id' | 'producer'>[]): Promise<Product[]> {
        const items = await this.client.db(process.env.DB_NAME).collection('products').insertMany(products);
        const ids = Object.values(items.insertedIds).map(id => id.toString());
        return Promise.all(ids.map(id => this.getById(id)));
    }

    async update(_id: string, data: Partial<Product>): Promise<Product> {
        const updateFields: Partial<Product> = Object.keys(data).reduce((acc, key) => {
            if (data[key]) acc[key] = data[key];
            return acc;
        }, {});

        await this.client.db(process.env.DB_NAME).collection('products').findOneAndUpdate({
            _id: {
                $eq: new ObjectId(_id)
            }
        }, {
            $set: updateFields
        }, {
            returnDocument: 'after'
        });

        return this.getById(_id);
    }

    async delete(_ids: string[]): Promise<boolean> {
        const result = await this.client.db(process.env.DB_NAME).collection('products').deleteMany({
            _id: {
                $in: _ids.map(id => new ObjectId(id))
            }
        }).catch(e => {
            logger.error(e, 'Failed to delete products!');
            return {
                deletedCount: 0
            };
        });
        return result.deletedCount === _ids.length;
    }

    async startSyncJob(): Promise<boolean> {
        spawn("npm", ["run", "sync-products"], { detached: true, stdio: "ignore" });
        return true;
    }

    private async producerEntryToModel(producerId: string): Promise<Producer> {
        if (!producerId) {
            return null;
        }
        let objectId: ObjectId;
        try {
            objectId = new ObjectId(producerId);
        } catch (e) {
            logger.error(e, 'Unable to parse producer id. Producer ID:' + producerId);
            return null;
        }


        let producer: any;
        try {

            producer = await this.client.db(process.env.DB_NAME).collection('producers').findOne({
                _id: {
                    $eq: objectId
                }
            }, {});

        } catch (e) {
            logger.error(e, 'Unable to fetch a producer! Producer ID: ' + producerId);
            return null;
        }

        return {
            _id: producer._id.toString(),
            name: producer.name,
            country: producer.country,
            region: producer.region
        };
    }

    private async productEntryToModel(entry: any): Promise<Product> {

        return {
            _id: entry._id.toString(),
            name: entry.name,
            vintage: entry.vintage,
            producerId: entry.producerId,
            producer: await this.producerEntryToModel(entry.producerId)
        } as Product;
    }
}