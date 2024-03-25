import { ObjectId, Product } from "../types";

export interface ProductService {
    getAllProducts(): Promise<Product[]>
    getById(id: ObjectId): Promise<Product | null>;
    getByProducerId(producerId: ObjectId): Promise<Product[]>;
    create(products: Omit<Product, '_id' | 'producer'>[]): Promise<Product[]>;
    update(_id: ObjectId, data: Partial<Product>): Promise<Product>;
    delete(_ids: ObjectId[]): Promise<boolean[]>;
}

export class ProductServiceMongoDbImpl implements ProductService {
    async getAllProducts(): Promise<Product[]> {
        return [{
            _id: '1',
            name: 'product 1',
            producerId: '1',
            producer: {
                _id: '1',
                name: 'producer 1',
                country: 'country 1',
                region: 'region 1'
            },
            vintage: 'vintage 1'
        }];
        // throw new Error('Method not implemented');
    }
    async getById(id: ObjectId): Promise<Product | null> {
        return {
            _id: id,
            name: 'product 1',
            producerId: '1',
            producer: {
                _id: '1',
                name: 'producer 1',
                country: 'country 1',
                region: 'region 1'
            },
            vintage: 'vintage 1'
        }
        // throw new Error('Method not implemented.');
    }
    async getByProducerId(producerId: ObjectId): Promise<Product[]> {
        throw new Error('Method not implemented.');
    }
    async create(products: Omit<Product, '_id' | 'producer'>[]): Promise<Product[]> {
        return [{
            _id: '1',
            name: 'product 1',
            producerId: '1',
            producer: {
                _id: '1',
                name: 'producer 1',
                country: 'country 1',
                region: 'region 1'
            },
            vintage: 'vintage 1'
        }]
        // throw new Error('Method not implemented.');
    }
    async update(_id: ObjectId, data: Partial<Product>): Promise<Product> {
        return {
            _id: '1',
            name: 'product 1',
            producerId: '1',
            producer: {
                _id: '1',
                name: 'producer 1',
                country: 'country 1',
                region: 'region 1'
            },
            vintage: 'vintage 1'
        }
        // throw new Error('Method not implemented.');
    }
    async delete(_ids: ObjectId[]): Promise<boolean[]> {
        return [true];
        // throw new Error('Method not implemented.');
    }
}