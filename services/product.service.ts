import { ObjectId, Product } from "../types";

export interface ProductService {
    getById(id: ObjectId): Promise<Product | null>;
    getByProducerId(producerId: ObjectId): Promise<Product[]>;
    create(products: Omit<Product, '_id'>[]): Promise<Product>;
    update(_id: ObjectId, data: Omit<Product, '_id'>): Promise<Product>;
    delete(_ids: ObjectId[]): Promise<boolean[]>;
}

export class ProductServiceMongoDbImpl implements ProductService {
    getById(id: ObjectId): Promise<Product | null> {
        throw new Error('Method not implemented.');
    }
    getByProducerId(producerId: ObjectId): Promise<Product[]> {
        throw new Error('Method not implemented.');
    }
    create(products: Omit<Product, '_id'>[]): Promise<Product> {
        throw new Error('Method not implemented.');
    }
    update(_id: ObjectId, data: Omit<Product, '_id'>): Promise<Product> {
        throw new Error('Method not implemented.');
    }
    delete(_ids: ObjectId[]): Promise<boolean[]> {
        throw new Error('Method not implemented.');
    }
}