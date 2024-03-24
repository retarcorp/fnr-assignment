import * as http from 'http';
import 'dotenv/config'
import GraphQLController from './controllers/graphql.controller';

const graphqlController = new GraphQLController();

const server = http.createServer(async (req: http.IncomingMessage, res: http.ServerResponse) => {

    const method = req.method as string;
    const url = req.url;

    // if request method is post and url is /graphql send handling to a controller
    if (method === 'POST' && url === '/graphql') {

        return await graphqlController.exec(req, res);
    }

    res.writeHead(405, {'Content-Type': 'text/plain'});
    res.end('Method and/or URL are not allowed!\n');
});

server.listen(process.env.HTTP_PORT);
console.log('Server listening on port ' + process.env.HTTP_PORT);