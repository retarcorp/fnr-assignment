import * as http from 'http';
import 'dotenv/config'
import GraphQLController from './controllers/graphql.controller';
import { GraphqlResolverMongoServiceImpl } from './resolvers/graphql.resolver';
import { MongoClient, ServerApiVersion } from 'mongodb';
import { ProductServiceMongoDbImpl } from './services/product.service';

let controller: GraphQLController;

const server = http.createServer(async (req: http.IncomingMessage, res: http.ServerResponse) => {

    const method = req.method as string;
    const url = req.url;

    // if request method is post and url is /graphql send handling to a controller
    if (method === 'POST' && url === '/graphql') {

        return await controller.exec(req, res);
    }

    res.writeHead(405, {'Content-Type': 'text/plain'});
    res.end('Method and/or URL are not allowed!\n');
});

server.on('listening', async () => {
    console.log('Server listening on port ' + process.env.HTTP_PORT);
    const client = new MongoClient(process.env.MONGODB_CONNECTION_STRING, {
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

    const service = new ProductServiceMongoDbImpl(client);
    const resolver = new GraphqlResolverMongoServiceImpl(service);
    controller = new GraphQLController(resolver);
})

server.on('close', () => {

})

server.listen(process.env.HTTP_PORT);