const Memcached = require('memcached');

const memcached = new Memcached('127.0.0.1:11111', { retries: 10, retry: 10000, remove: true, debug: true });

memcached.get('echidna', function (err, data) {
    if (err)  {
        console.log(err);
    }
    console.log(`GET operation status: ${data}`);
  });