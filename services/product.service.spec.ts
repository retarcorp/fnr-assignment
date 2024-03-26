import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";
import { ProductServiceMongoDbImpl } from "./product.service";
import 'dotenv/config';

describe('ProductService', () => {

    let client: MongoClient;
    let service: ProductServiceMongoDbImpl;
    let producerId: string;

    beforeAll(async () => {
        client = new MongoClient(process.env.MONGODB_CONNECTION_STRING, {
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
    
        service = new ProductServiceMongoDbImpl(client);

        const producers = client.db(process.env.MONGODB_DB_NAME).collection('producers');
        const result = await producers.insertOne({ name: 'Test Producer' });
        producerId = result.insertedId.toString();
        console.log('Producer ID:', producerId);
    })

    afterAll(async () => {
        await client.db(process.env.MONGODB_DB_NAME).collection('products').deleteMany({ producerId: { $eq: producerId }});
        await client.db(process.env.MONGODB_DB_NAME).collection('producers').deleteOne({ _id: new ObjectId(producerId) });
        await client.close();
    })

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should create a bunch of products', async () => {
        const productService = service;
        const products = await productService.create([
            { name: 'product 1', producerId, 'vintage': 'vintage 1'},
            { name: 'product 2', producerId, 'vintage': 'vintage 2'},
            { name: 'product 3', producerId, 'vintage': 'vintage 3'}
        ]);

        expect(products).toBeDefined();
        expect(products.length).toBe(3);

        const fetchedProducts = await productService.getAllProducts();
        expect(fetchedProducts).toBeDefined();
        expect(fetchedProducts.length).toBeGreaterThanOrEqual(3);
    })

    it('should update a product', async () => {
        const productService = service;
        const products = await productService.create([
            { name: 'product 1', producerId, 'vintage': 'vintage 1'},
            { name: 'product 2', producerId, 'vintage': 'vintage 2'},
            { name: 'product 3', producerId, 'vintage': 'vintage 3'}
        ]);

        const updatedProduct = await productService.update(products[0]._id, { name: 'product 1 updated'});
        expect(updatedProduct).toBeDefined();
        expect(updatedProduct.name).toBe('product 1 updated');

        const fetchedById = await productService.getById(products[0]._id);
        expect(fetchedById).toBeDefined();
        expect(fetchedById.name).toBe('product 1 updated');        
    })

    it('should delete a product', async () => {
        const productService = service;
        const products = await productService.create([
            { name: 'product 1', producerId, 'vintage': 'vintage 1'},
            { name: 'product 2', producerId, 'vintage': 'vintage 2'},
            { name: 'product 3', producerId, 'vintage': 'vintage 3'}
        ]);

        const dbLength = (await productService.getAllProducts()).length;

        const deleted = await productService.delete(products.map(p => p._id));
        expect(deleted).toBeDefined();
        expect(deleted).toBeTruthy();
        
        const fetchedProducts = await productService.getAllProducts();
        expect(fetchedProducts).toBeDefined();
        expect(fetchedProducts.length).toBe(dbLength - 3);
    });

    it('should get products by producer id', async () => {

        const productService = service;
        await productService.create([
            { name: 'product 1', producerId, 'vintage': 'vintage 1'},
            { name: 'product 2', producerId, 'vintage': 'vintage 2'},
            { name: 'product 3', producerId, 'vintage': 'vintage 3'}
        ]);       

        const fetchedProducts = await productService.getByProducerId(producerId);

        expect(fetchedProducts).toBeDefined();
        expect(fetchedProducts.length).toBeGreaterThanOrEqual(3);
        expect(fetchedProducts.every(p => p.producerId === producerId)).toBeTruthy();
    });
});