import { spec } from 'pactum';
import { spawnSync } from 'child_process';
import 'dotenv/config';
import { MongoClient, ServerApiVersion } from 'mongodb';

describe('Products GraphQL API', () => {

    let client: MongoClient;
    let producerIds: string[];
    const TEST_TIMEOUT = 10000;

    beforeAll(async () => {
        spawnSync("npm", ["run", "seed-db"]);
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


        const producers = client.db(process.env.DB_NAME).collection('producers');
        const result = await producers.find().toArray();
        producerIds = result.map(({ _id }) => _id.toString());
    }, 20000)

    afterAll(async () => {
        await client.close();
    })

    const url = `http://localhost:${process.env.HTTP_PORT}/graphql`;

    it('Fetches the schema', async () => {
        await spec().get(url).expectStatus(200).expectHeader('content-type', 'text/plain');
    }, TEST_TIMEOUT)

    it('Executes a query', async () => {
        await spec().post(url).withJson({
            query: `{
                getProducts {
                    _id,
                    name
                    vintage
                    producer {
                        _id,
                        name
                        country
                        region
                    }
                }
            }`
        })
            .expectStatus(200).expectHeader('content-type', 'application/json')
            .returns((ctx) => {
                const { data } = ctx.res.json;
                expect(data).toBeDefined();
                expect(data.getProducts).toBeDefined();
                expect(data.getProducts.every(({ producer }) => producerIds.includes(producer._id))).toBeTruthy()
            })
    }, TEST_TIMEOUT)

    it('Gets products by producer id', async () => {
        const query = `
        query ($id: String!) {
            getProductsByProducer(producerId: $id) {
                _id,
                name,
                vintage,
                producer {
                    _id,
                    name
                } 
            }
        }
        `;
        const variables = {
            "id": producerIds[0]
        }
        await spec().post(url).withJson({ query, variables })
            .expectStatus(200)
            .expectHeader('content-type', 'application/json')
            .returns((ctx) => {
                const { data } = ctx.res.json;
                expect(data).toBeDefined();
                expect(data.getProductsByProducer).toBeDefined();
                expect(data.getProductsByProducer.every(({ producer }) => producer._id === producerIds[0])).toBeTruthy()
            })
    }, TEST_TIMEOUT)

    it('Creates a product and fetches it back', async () => { 
        const query = `
        mutation ($params: [CreateProductParams]!) {
            addProduct(params: $params) {
                _id,
                name,
                vintage,
                producer {
                    _id,
                    name,
                    country,
                    region
                }
            }
        }
        `;
        const variables = {
            "params": [
                {
                    "vintage": "2020",
                    "name": "Product " + Math.round(Math.random() * 10000000 + 10**6),
                    "producerId": producerIds[0]
                }
            ]
        };
        await spec().post(url).withJson({ query, variables })
            .expectStatus(200)
            .expectHeader('content-type', 'application/json')
            .returns((ctx) => {
                const { data } = ctx.res.json;
                expect(data).toBeDefined();
                expect(data.addProduct).toBeDefined();
                expect(data.addProduct[0].name).toEqual(variables.params[0].name);
                expect(data.addProduct[0].vintage).toEqual(variables.params[0].vintage);
                expect(data.addProduct[0].producer._id).toEqual(variables.params[0].producerId);
            })
    }, TEST_TIMEOUT);

    it('Updates a product in a DB and fetches back by ID', () => {

        return spec().post(url).withJson({
            query: `{
                getProducts {
                    _id,
                    name
                    vintage
                    producer {
                        _id,
                        name
                        country
                        region
                    }
                }
            }`
        })
        .returns((ctx) => {
            const { data } = ctx.res.json;
            expect(data).toBeDefined();
            expect(data.getProducts).toBeDefined();
            expect(data.getProducts.length).toBeGreaterThan(0);
            const product = data.getProducts[0];

            const query = `
                mutation($productId: String!, $name: String, $vintage: String, $producerId: String) {
                    updateProduct(productId: $productId, name: $name, vintage: $vintage, producerId: $producerId) {
                        name,
                        vintage,
                        producer {
                            name
                        }
                    }
                }
            `;

            const variables = {
                "productId": product._id,
                "name": "Updated Product Name",
            }

            return spec().post(url).withJson({ query, variables })
                .expectStatus(200)
                .expectHeader('content-type', 'application/json')
                .returns((ctx) => {
                    const { data } = ctx.res.json;
                    expect(data).toBeDefined();
                    expect(data.updateProduct).toBeDefined();
                    expect(data.updateProduct).toBeTruthy();
                    expect(data.updateProduct.name).toEqual(variables.name);

                    return spec().post(url).withJson({
                        query: `{
                            getProductById(productId: "${product._id}") {
                                name,
                                vintage,
                                producer {
                                    name
                                }
                            }
                        }`
                    }).returns((ctx) => {
                        const { data } = ctx.res.json;
                        expect(data).toBeDefined();
                        expect(data.getProductById).toBeDefined();
                        expect(data.getProductById.name).toEqual(variables.name);
                    });
                })

        })
    }, TEST_TIMEOUT)

    it('Deletes a product forever from a DB', async () => {

        const DELETE_COUNT = 50;

        return spec().post(url).withJson({
            query: `{
                getProducts {
                    _id,
                    name
                    vintage
                    producer {
                        _id,
                        name
                        country
                        region
                    }
                }
            }`
        })
        .returns((ctx) => {
            const { data } = ctx.res.json;
            expect(data).toBeDefined();
            expect(data.getProducts).toBeDefined();
            expect(data.getProducts.length).toBeGreaterThan(0);
            const ids = data.getProducts.map(({ _id }) => _id);
            const initialCount = ids.length;

            const query = `
                mutation ($ids: [String]!) {
                    deleteProducts(productIds: $ids)
                }
            `;
            const variables = {
                "ids": ids.slice(0, DELETE_COUNT)
            };

            return spec().post(url).withJson({ query, variables })
                .expectStatus(200)
                .expectHeader('content-type', 'application/json')
                .returns((ctx) => {
                    const { data } = ctx.res.json;
                    expect(data).toBeDefined();
                    expect(data.deleteProducts).toBeDefined();
                    expect(data.deleteProducts).toBeTruthy();

                    return spec().post(url).withJson({
                        query: `{
                            getProducts {
                                _id,
                                name
                                vintage
                                producer {
                                    _id,
                                    name
                                    country
                                    region
                                }
                            }
                        }`
                    })
                    .returns((ctx) => {
                        const { data } = ctx.res.json;
                        expect(data).toBeDefined();
                        expect(data.getProducts).toBeDefined();
                        expect(data.getProducts.length).toBeLessThanOrEqual(initialCount - DELETE_COUNT);
                    });

                })
        
        })

    }, TEST_TIMEOUT)
})