import { assert } from 'chai';
import { describe, it } from 'mocha';
import Memcached from 'memcached';
import Server from '../src/server';

// Initialize memcached server
const memcached = new Server();
const options = {
    port: 11111,
    host: 'localhost',
};
memcached.start(options);

// Initialize client module
const client = new Memcached('127.0.0.1:11111');

const testParameters = {
    key: 'foo',
    initialValue: 'This is a great test',
    uniqueCas: null,
};

describe('Node-Memcached Integration tests', function run() {
    this.timeout(60 * 1000);

    it('SET a new record and return STORED', async () => {
        client.set(testParameters.key, testParameters.initialValue, 900, (err, rsp) => {
            if (err) {
                console.log(err);
                assert.boom();
            }
            assert.equal(rsp, true);
        });
    });

    it('GET the previously created record and match the value', async () => {
        client.get(testParameters.key, (err, rsp) => {
            if (err) {
                console.log(err);
            }
            assert.equal(rsp, testParameters.initialValue);
        });
    });

    it('GETS the previously created record match the value and store uniqueCas for later', async () => {
        client.gets(testParameters.key, (err, rsp) => {
            if (err) {
                console.log(err);
            }
            testParameters.uniqueCas = rsp.cas;
            assert.equal(rsp[testParameters.key], testParameters.initialValue);
        });
    });

    it('CAS the previously created record', async () => {
        client.cas(testParameters.key, testParameters.initialValue, 900, testParameters.uniqueCas, (err, rsp) => {
            if (err) {
                console.log(err);
            }
            assert.equal(rsp, true);
        });
    });
});
