import { buildSchema, graphql } from "graphql";
import { readFileSync } from "fs";
import { ProductService, ProductServiceMongoDbImpl } from "../services/product.service";
import { Product } from "../types";

export interface GraphqlResolver {
    productService: ProductService;
    getProducts(): Promise<Product[]>;
    getProductsByProducer(producerId: string): Promise<Product[]>;
    getProductById(params: { productId: string }): Promise<Product | null>;
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

    async getProductById({ productId }: {productId: string}): Promise<Product | null> {
        return this.productService.getById(productId);
    }
}
