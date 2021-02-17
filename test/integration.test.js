/* eslint-disable max-lines-per-function */
import { assert } from 'chai';
import { describe, it } from 'mocha';
import Memcached from 'memcached-promise';
import Server from '../src/lib/server';

// Initialize memcached server
const memcached = new Server();
const options = {
    port: 11111,
    host: 'localhost',
};
memcached.start(options);

// Initialize client module
const client = new Memcached('127.0.0.1:11111', {
    retries: 10, retry: 10000, remove: true, debug: false,
});

const testParameters = {
    key: 'foo',
    initialValue: 'This is a great test',
    uniqueCas: null,
    casValueInsert: 'But it could be even better',
    addKey: 'fizz',
    addValue: 'buzz',
    replaceValue: 'new value',
};

describe('Node-Memcached Integration tests', function run() {
    this.timeout(60 * 1000);

    it('SET a new record and return STORED', async () => {
        const response = await client.set(testParameters.key, testParameters.initialValue, 900);
        assert.equal(response, true);
    });

    it('GET the previously created record and match the value', async () => {
        const response = await client.get(testParameters.key);
        assert.equal(response, testParameters.initialValue);
    });

    it('GETS the previously created record match the value and store uniqueCas for later', async () => {
        const response = await client.gets(testParameters.key);
        testParameters.uniqueCas = response.cas;
        assert.equal(response[testParameters.key], testParameters.initialValue);
    });

    it('CAS the previously created record', async () => {
        const response = await client.cas(testParameters.key, testParameters.casValueInsert, testParameters.uniqueCas, 900);
        const checkup = await client.get(testParameters.key);
        assert.ok(response);
        assert.equal(checkup, testParameters.casValueInsert);
    });

    it('ADD a new record', async () => {
        const response = await client.add(testParameters.addKey, testParameters.addValue, 900);
        const checkup = await client.get(testParameters.addKey);
        assert.ok(response);
        assert.equal(checkup, testParameters.addValue);
    });

    it('REPLACE an old record', async () => {
        const response = await client.replace(testParameters.addKey, testParameters.replaceValue, 900);
        const checkup = await client.get(testParameters.addKey);
        assert.ok(response);
        assert.equal(checkup, testParameters.replaceValue);
    });

    it('APPEND value to a record', async () => {
        await client.set('echidna', 'fizz', 900);
        client.append('echidna', 'buzz').then(async () => {
            const checkup = await client.get('echidna');
            assert.equal(checkup, 'fizzbuzz');
        });
    });

    it('PREPEND value to a record', async () => {
        await client.set('carpincho', 'bara', 900);
        client.prepend('carpincho', 'capy').then(async () => {
            const checkup = await client.get('carpincho');
            assert.equal(checkup, 'capybara');
        });
    });

    it('DELETE a record', async () => {
        await client.set('dead', 'soon', 900);
        const before = await client.get('dead');
        client.del('dead').then(async () => {
            const after = await client.get('dead');
            assert.notEqual(before, after);
        });
    });
});
