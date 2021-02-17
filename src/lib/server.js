import net from 'net';
import Parser from './parser';
import Cache from './cache';

const DEFAULT_PORT = 11111;
const DEFAULT_HOST = 'localhost';

const parser = new Parser();
export default class Server {
    constructor() {
        this.server = null;
        this.cache = new Cache();
    }

    start(options = {}) {
        this.port = options.port || DEFAULT_PORT;
        this.host = options.host || DEFAULT_HOST;
        this.server = net.createServer(this.clientConnection);
        this.server.listen(this.port, this.host, () => {
            console.log(`Server started on ${this.host}:${this.port}`);
        });
    }

    clientConnection = (socket) => {
        console.log(`${socket.remoteAddress}:${socket.remotePort} Connected`);
        socket.on('data', (data) => {
            console.log(`${socket.remoteAddress}:${socket.remotePort}: ${data}`);
            try {
                const responseArray = this.handleCommand(parser.read(data));
                responseArray.forEach((response) => {
                    if (response) {
                        socket.write(`${response}\r\n`);
                    }
                });
                socket.write('END\r\n');
            } catch (error) {
                console.error(`Internal server error, please debug: ${error}`);
                socket.write('ERROR\r\n');
            }
        });
        socket.on('close', () => {
            console.log(`${socket.remoteAddress}:${socket.remotePort} Terminated the connection`);
        });
        socket.on('error', (error) => {
            console.error(`${socket.remoteAddress}:${socket.remotePort} Connection Error ${error}`);
        });
    }

    /**
     * method router
     * @param {object} request payload
     * @returns {array}
     */
    handleCommand(req) {
        if (req) {
            switch (req.command) {
            case 'get':
                return req.keys.map((key) => this.cache.get(key));
            case 'gets':
                return req.keys.map((key) => this.cache.gets(key));
            case 'delete':
                return req.keys.map((key) => this.cache.delete(key));
            case 'set':
                return [this.cache.set(req.key, req.value, req.exptime, req.flags)];
            case 'add':
                return [this.cache.add(req.key, req.value, req.exptime, req.flags)];
            case 'replace':
                return [this.cache.replace(req.key, req.value, req.exptime, req.flags)];
            case 'append':
                return [this.cache.append(req.key, req.value)];
            case 'prepend':
                return [this.cache.prepend(req.key, req.value)];
            case 'cas':
                return [this.cache.cas(req.key, req.value, req.exptime, req.flags, req.uniqueCas)];
            case 'flush':
                return [this.cache.flush()];
            case 'stats':
                return [JSON.stringify(this.cache.stats())];
            default:
                return ['ERROR'];
            }
        } return ['CLIENT_ERROR'];
    }
}
