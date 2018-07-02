const Path = require('path');
const LogUtil = require('@flyme/skynet-utils/lib/logUtil.js');
const ApiUtil = require('../utils/apiUtil.js');

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
          path: '/meizu_test_vc_auth',
          handler: function(request, reply) {
            reply.file(Path.resolve(__dirname, '../test/meizu_test_vc_auth.html'));
          }
        });
        server.route({
          method: 'GET',
          path: '/meizu_test_warnning_message',
          handler: function(request, reply) {
            reply.file(Path.resolve(__dirname, '../test/warn.html'));
          }
        });
        server.route({
          method: 'GET',
          path: '/meizu_get_warnning_message',
          handler: function(request, reply) {
            var type = request.query.type,
                project = request.query.project,
                cur = request.query.cur,
                pageSize = request.query.pageSize,
                time = request.query.time;
            ApiUtil.warnPageQueryPerDay({
              time: time,
              pageSize: pageSize,
              cur: cur
            }, reply, 'meizu_get_warnning_message', {
              type: type,
              project: project
            }, {}, true);
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
