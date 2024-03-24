import http, { ServerResponse } from 'http';

export default class GraphQLController {
    constructor() { }

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
            const body = await this.fetchBody(req);
            const query = JSON.parse(body).query;
            console.log(query);
            // map actions to gql operation types 
            // parse query and execute actions

        } catch (e) {
            console.error(e);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error: graphql parsing failed.\n');
        }

        return res.end();
    }
}