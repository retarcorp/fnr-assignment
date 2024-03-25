import { ProductServiceMongoDbImpl } from "./product.service";

describe('ProductService', () => {

    it('should be defined', () => {
        expect(new ProductServiceMongoDbImpl()).toBeDefined();
    });

    it('should create a bunch of products', async () => {
        const productService = new ProductServiceMongoDbImpl();
        const products = await productService.create([
            { name: 'product 1', producerId: '1', 'vintage': 'vintage 1'},
            { name: 'product 2', producerId: '2', 'vintage': 'vintage 2'},
            { name: 'product 3', producerId: '3', 'vintage': 'vintage 3'}
        ]);
        expect(products).toBeDefined();
        expect(products.length).toBe(3);

        const fetchedProducts = await productService.getAllProducts();
        expect(fetchedProducts).toBeDefined();
        expect(fetchedProducts.length).toBeGreaterThanOrEqual(3);
    })

    it('should update a product', async () => {
        const productService = new ProductServiceMongoDbImpl();
        const products = await productService.create([
            { name: 'product 1', producerId: '1', 'vintage': 'vintage 1'},
            { name: 'product 2', producerId: '2', 'vintage': 'vintage 2'},
            { name: 'product 3', producerId: '3', 'vintage': 'vintage 3'}
        ]);

        const updatedProduct = await productService.update(products[0]._id, { name: 'product 1 updated'});
        expect(updatedProduct).toBeDefined();
        expect(updatedProduct.name).toBe('product 1 updated');

        const fetchedById = await productService.getById(products[0]._id);
        expect(fetchedById).toBeDefined();
        expect(fetchedById.name).toBe('product 1 updated');        
    })

    it('should delete a product', async () => {
        const productService = new ProductServiceMongoDbImpl();
        const products = await productService.create([
            { name: 'product 1', producerId: '1', 'vintage': 'vintage 1'},
            { name: 'product 2', producerId: '2', 'vintage': 'vintage 2'},
            { name: 'product 3', producerId: '3', 'vintage': 'vintage 3'}
        ]);

        const dbLength = (await productService.getAllProducts()).length;

        const deleted = await productService.delete(products.map(p => p._id));
        expect(deleted).toBeDefined();
        expect(deleted.length).toBe(3);
        expect(deleted.every(d => d)).toBeTruthy();
        
        const fetchedProducts = await productService.getAllProducts();
        expect(fetchedProducts).toBeDefined();
        expect(fetchedProducts.length).toBe(dbLength - 3);
    });

    it('should get products by producer id', async () => {
        const productService = new ProductServiceMongoDbImpl();
        await productService.create([
            { name: 'product 1', producerId: 'producer-id', 'vintage': 'vintage 1'},
            { name: 'product 2', producerId: 'producer-id', 'vintage': 'vintage 2'},
            { name: 'product 3', producerId: 'producer-id', 'vintage': 'vintage 3'}
        ]);

        const fetchedProducts = await productService.getByProducerId('producer-id');
        expect(fetchedProducts).toBeDefined();
        expect(fetchedProducts.length).toBeGreaterThanOrEqual(3);
        expect(fetchedProducts.every(p => p.producerId === 'producer-id')).toBeTruthy();
    });
});