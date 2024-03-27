import * as http from 'http';
import 'dotenv/config'
import GraphQLController from './controllers/graphql.controller';
import { GraphqlResolver, GraphqlResolverMongoServiceImpl } from './resolvers/graphql.resolver';
import { MongoClient, ServerApiVersion } from 'mongodb';
import { ProductServiceMongoDbImpl } from './services/product.service';
import logger from './utils/logger';

let controller: GraphQLController;
let client: MongoClient;

const server = http.createServer(async (req: http.IncomingMessage, res: http.ServerResponse) => {

    const method = req.method as string;
    const url = req.url;

    if (url === '/graphql') {

        if (method === 'GET') {
            return await controller.getSchema(req, res);
        }

        if (method === 'POST') {
            return await controller.exec(req, res);
        }
    }

    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Method and/or URL are not allowed!\n');
});

server.on('listening', async () => {
    logger.debug('Server listening on port ' + process.env.HTTP_PORT);
    client = new MongoClient(process.env.MONGODB_CONNECTION_STRING, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    });

    await client.connect()
        .catch((err: Error) => {
            logger.fatal('Failed to connect to MongoDB', err);
        });

    const service = new ProductServiceMongoDbImpl(client);
    const resolver = new GraphqlResolverMongoServiceImpl(service) as GraphqlResolver;
    controller = new GraphQLController(resolver);
})

server.on('close', () => {
    client.close();
})

server.listen(process.env.HTTP_PORT);