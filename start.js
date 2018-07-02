const Hapi = require('hapi');
const Good = require('./src/router/good.js');
const Api = require('./src/router/api.js');
const Test = require('./src/router/test.js');
const Vconsole = require('./src/router/vconsole.js');


const server = new Hapi.Server();
server.connection({
  port: 9999
});

Api.init(server);
Test.init(server);
Vconsole.init(server);
Good.init(server);

console.log('monitor-server start success!')
