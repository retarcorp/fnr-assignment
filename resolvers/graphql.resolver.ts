import { buildSchema, graphql } from "graphql";
import { readFileSync } from "fs";
import { ProductService, ProductServiceMongoDbImpl } from "../services/product.service";
import { Product } from "../types";

export interface GraphqlResolver {
    productService: ProductService;
    getProducts(): Promise<Product[]>;
    getProductsByProducer(producerId: string): Promise<Product[]>;
    getProductById(params: { productId: string }): Promise<Product | null>;
    addProduct(input: { params: { name: string, producerId: string, vintage?: string }[]}): Promise<Product[]>;
    updateProduct(params: { productId: string, name?: string, vintage?: string }): Promise<Product>;
    deleteProducts(params: { productIds: string[] }): Promise<boolean[]>;
}
export class GraphqlResolverMongoServiceImpl implements GraphqlResolver {
    productService: ProductService;
    constructor() {
        this.productService = new ProductServiceMongoDbImpl();
    }

    async getProducts(): Promise<Product[]> {
        return this.productService.getAllProducts();
    }

    async getProductsByProducer(producerId: string): Promise<Product[]> {
        return this.productService.getByProducerId(producerId);
    }

    async getProductById({ productId }: { productId: string }): Promise<Product | null> {
        return this.productService.getById(productId);
    }

    async addProduct(input: { params: { name: string, producerId: string, vintage?: string }[]}): Promise<Product[]> {
        const params = input.params;
        return this.productService.create(params.map(p => ({ name: p.name, producerId: p.producerId, vintage: p.vintage || ''})));
    }

    async updateProduct({ productId, name, vintage }: { productId: string, name?: string, vintage?: string }): Promise<Product> {
        return this.productService.update(productId, { name, vintage: (vintage || '') });
    }

    async deleteProducts({ productIds }: { productIds: string[] }): Promise<boolean[]> {
        return this.productService.delete(productIds);
    }
}

