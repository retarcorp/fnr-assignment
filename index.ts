import * as http from 'http';
import 'dotenv/config'

const server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {

    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hello World\n');
});

server.listen(process.env.HTTP_PORT);
console.log('Server listening on port ' + process.env.HTTP_PORT);