import net from 'net';
import Parser from './parser';
import Cache from './cache';

const DEFAULT_PORT = 11111;
const DEFAULT_HOST = 'localhost';

export default class Server {
    constructor() {
        this.server = null;
        this.cache = new Cache();
    }

    start(options) {
        this.port = options.port || DEFAULT_PORT;
        this.host = options.host || DEFAULT_HOST;
        this.server = net.createServer(this.clientConnection);
        this.server.listen(this.port, this.host, () => {
            console.log(`Server started on port ${this.port} at ${this.host}`);
        });
    }

    clientConnection = (socket) => {
        // Log when a client connnects.
        console.log(`${socket.remoteAddress}:${socket.remotePort} Connected`);
        // Listen for data from the connected client.
        socket.on('data', (data) => {
            // Log data from the client
            console.log(`${socket.remoteAddress}:${socket.remotePort}: ${data} `);
            // TODO: Here's where the magic happens.
            const parser = new Parser();
            const response = this.handleCommand(parser.translate(data));
            // Send back the data to the client.
            socket.write(`${response}\r\n`);
        });
        // Handle client connection termination.
        socket.on('close', () => {
            console.log(`${socket.remoteAddress}:${socket.remotePort} Terminated the connection`);
        });
        // Handle Client connection error.
        socket.on('error', (error) => {
            console.error(`${socket.remoteAddress}:${socket.remotePort} Connection Error ${error}`);
        });
    }

    /**
     * @param {object} payload
     * @returns {string}
     */
    handleCommand(req) {
        switch (req.command) {
        case 'get':
            return this.cache.get(req.key);
        case 'set':
            return this.cache.set(req.key, req.value, req.exptime, req.flags);
        case 'stats':
            return JSON.stringify(this.cache.stats());
        default:
            return 'ERROR\r\n';
        }
    }
}
