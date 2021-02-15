import Server from './src/server';

const memcached = new Server();

const options = {
    port: 11111,
    host: 'localhost',
};

memcached.start(options);
