const Memcached = require('memcached');

const memcached = new Memcached('127.0.0.1:11111');

memcached.set('foo', 'dfsdfsdf', 900, function (err, data) {
    if (err)  {
        console.log(err);
    }
    console.log(data);
  });