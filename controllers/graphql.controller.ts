import http, { ServerResponse } from 'http';
import { GraphqlResolverMongoServiceImpl } from '../resolvers/graphql.resolver';
import { buildSchema, graphql } from 'graphql';
import { readFileSync } from 'fs';

export default class GraphQLController {
    schema: any;

    constructor() {
        this.schema = buildSchema(readFileSync('./schema/types.gql').toString());
    }

    fetchBody(req: http.IncomingMessage): Promise<string> {
        // Todo extract to a separate file
        return new Promise((resolve, reject) => {
            let body = '';
            req.on('data', (chunk) => {
                body += chunk;
            });
            req.on('end', () => {
                resolve(body);
            });
            req.on('error', (err) => {
                reject(err);
            });
        });
    }

    async exec(req: http.IncomingMessage, res: http.ServerResponse): Promise<http.ServerResponse> {

        try {
            const body = JSON.parse(await this.fetchBody(req));
            const { variables, query } = body;

            const resolver = new GraphqlResolverMongoServiceImpl();
            const result = await graphql({
                schema: this.schema,
                source: query,
                rootValue: resolver,
                variableValues: variables
            })


            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result));

        } catch (e) {
            console.error(e);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error.\n');
        }

        return res.end();
    }
}