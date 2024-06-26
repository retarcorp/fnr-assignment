import { IncomingMessage, ServerResponse } from 'http';
import { GraphqlResolver } from '../resolvers/graphql.resolver';
import { GraphQLSchema, buildSchema, graphql } from 'graphql';
import { readFileSync } from 'fs';
import logger from '../utils/logger';

export default class GraphQLController {
    schema: GraphQLSchema;
    resolver: GraphqlResolver;

    constructor(resolver: GraphqlResolver) {
        this.resolver = resolver;
        this.schema = buildSchema(readFileSync('./schema/types.gql').toString());
    }

    fetchBody(req: IncomingMessage): Promise<string> {
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

    async exec(req: IncomingMessage, res: ServerResponse): Promise<ServerResponse> {

        try {
            const body = JSON.parse(await this.fetchBody(req));
            const { variables, query } = body;

            const result = await graphql({
                schema: this.schema,
                source: query,
                rootValue: this.resolver,
                variableValues: variables
            })

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result));

        } catch (e) {
            logger.error(e, 'Failed to execute query ');
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error.\n');
        }

        return res.end();
    }

    async getSchema(req: IncomingMessage, res: ServerResponse): Promise<ServerResponse> {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(readFileSync('./schema/types.gql').toString());
        return res;
    }
}