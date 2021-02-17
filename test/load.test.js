/* eslint-disable max-nested-callbacks */
import Memcached from 'memcached-promise';
import { assert } from 'chai';
import { describe, it } from 'mocha';
import Server from '../src/lib/server';

const CONCURRENCY = 15;
const PORT = 11311;
const HOST = '127.0.0.1';
const DEFAULT_CLIENT_CONFIG = {
    retries: 10, retry: 10000, remove: true, debug: false,
};

// Initialize memcached server
const memcached = new Server();
const options = {
    port: PORT,
    host: HOST,
};
memcached.start(options);

const swarm = [];

for (let i = 0; i < CONCURRENCY; i++) {
    swarm.push({
        client: new Memcached(`${HOST}:${PORT}`, DEFAULT_CLIENT_CONFIG),
        key: `ape-${i}`,
        value: `shit-${i}`,
    });
}

const setPromises = swarm.map((item) => item.client.set(item.key, item.value, 90));
const readPromises = swarm.map((item) => (item.client.get(item.key)));
const expectedResults = swarm.map((item) => item.value);

describe('Manual load tests', function run() {
    this.timeout(60 * 1000);

    it('Should handle lots of concurrent conections without missing data', async () => {
        await Promise.all(setPromises).then(() => {
            console.log('Success, finish!');
            Promise.all(readPromises).then((results) => {
                console.log('Well we read something.');
                console.log(results);
                console.log('And we were expeting: ');
                console.log(expectedResults);
                assert.deepEqual(results, expectedResults);
            }).catch((err) => {
                console.log('Something went wrong on our lecture...');
                console.log(err);
                return false;
            });
        }).catch(() => {
            assert.fail('We had an error');
        });
    });
});
