import { ProductService, ProductServiceMongoDbImpl } from "../services/product.service";
import { Product } from "../types";

export interface GraphqlResolver {
    productService: ProductService;
    getProducts(): Promise<Product[]>;
    getProductsByProducer(params: {producerId: string}): Promise<Product[]>;
    getProductById(params: { productId: string }): Promise<Product | null>;
    addProduct(input: { params: { name: string, producerId: string, vintage?: string }[]}): Promise<Product[]>;
    updateProduct(params: { productId: string, name?: string, vintage?: string , producerId?: string}): Promise<Product>;
    deleteProducts(params: { productIds: string[] }): Promise<boolean>;
}
export class GraphqlResolverMongoServiceImpl implements GraphqlResolver {
    productService: ProductService;
    constructor(productService: ProductService) {
        this.productService = productService;
    }

    async getProducts(): Promise<Product[]> {
        return this.productService.getAllProducts();
    }

    async getProductsByProducer(params: {producerId: string}): Promise<Product[]> {
        return this.productService.getByProducerId(params.producerId);
    }

    async getProductById({ productId }: { productId: string }): Promise<Product | null> {
        return this.productService.getById(productId);
    }

    async addProduct(input: { params: { name: string, producerId: string, vintage?: string }[]}): Promise<Product[]> {
        const params = input.params;
        return this.productService.create(params.map(p => ({ name: p.name, producerId: p.producerId, vintage: p.vintage || ''})));
    }

    async updateProduct(params: { productId: string, name?: string, vintage?: string, producerId?: string }): Promise<Product> {
        const { productId, name, vintage, producerId} = params;
        return this.productService.update(productId, { name, vintage, producerId });
    }

    async deleteProducts({ productIds }: { productIds: string[] }): Promise<boolean> {
        return this.productService.delete(productIds);
    }
    async syncProducts(): Promise<Boolean> {
        return this.productService.startSyncJob();
    }
}

