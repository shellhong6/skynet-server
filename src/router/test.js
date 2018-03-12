const Path = require('path');
const LogUtil = require('@flyme/skynet-utils/lib/logUtil.js');

module.exports = {
  init: function(server) {
    server.register(require('inert'), (err) => {
        if (err) {
            LogUtil.log(err);
            return;
        }
        server.route({
          method: 'GET',
          path: '/meizu_test_page_only',
          handler: function(request, reply) {
            reply.file(Path.resolve(__dirname, '../test/test.html'));
          }
        });
        server.route({
          method: 'GET',
          path: '/img/{name}',
          handler: function(request, reply) {
            reply.file(Path.resolve(__dirname, `../test/${request.params.name}.jpg`));
          }
        });
        server.route({
          method: 'GET',
          path: '/js/{name}',
          handler: function(request, reply) {
            reply.file(Path.resolve(__dirname, `../test/${request.params.name}.js`));
          }
        });
    });
  }
}
