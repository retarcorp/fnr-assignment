import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";
import { Product } from "../types";


export interface ProductService {
    getAllProducts(): Promise<Product[]>
    getById(id: string): Promise<Product | null>;
    getByProducerId(producerId: string): Promise<Product[]>;
    create(products: Omit<Product, '_id' | 'producer'>[]): Promise<Product[]>;
    update(_id: string, data: Partial<Product>): Promise<Product>;
    delete(_ids: string[]): Promise<boolean>;
}

export class ProductServiceMongoDbImpl implements ProductService {

    private client: MongoClient;

    constructor(client: MongoClient) {
        this.client = client;
    }

    async getAllProducts(): Promise<Product[]> {
        const items = await this.client.db(process.env.DB_NAME).collection('products').find({}, {}).toArray();
        return items as unknown as Product[];
    }
    
    async getById(id: string): Promise<Product | null> {
        const item = await this.client.db(process.env.DB_NAME).collection('products').findOne({
            _id: {
                $eq: new ObjectId(id)
            }
        }, {});
        return item as unknown as Product | null;
    }

    async getByProducerId(producerId: string): Promise<Product[]> {
        throw new Error('Method not implemented.');
    }

    async create(products: Omit<Product, '_id' | 'producer'>[]): Promise<Product[]> {
        const items = await this.client.db(process.env.DB_NAME).collection('products').insertMany(products);
        const ids = Object.values(items.insertedIds).map(id => id.toString());
        return await Promise.all(ids.map(id => this.getById(id)));
    }

    async update(_id: string, data: Partial<Product>): Promise<Product> {
        const item = await this.client.db(process.env.DB_NAME).collection('products').findOneAndUpdate({
            _id: {
                $eq: new ObjectId(_id)
            }
        }, {
            $set: data
        }, {
            returnDocument: 'after'
        });
        return item as unknown as Product;
    }

    async delete(_ids: string[]): Promise<boolean> {
        const result = await this.client.db(process.env.DB_NAME).collection('products').deleteMany({
            _id: {
                $in: _ids.map(id => new ObjectId(id))
            }
        });
        return result.deletedCount === _ids.length;
    }
}