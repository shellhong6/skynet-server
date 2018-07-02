const Path = require('path');
const LogUtil = require('@flyme/skynet-utils/lib/logUtil.js');
const SettingUtil = require('../utils/settingUtil.js');
const AuthUtil = require('../utils/authUtil.js');
const Data = require('@flyme/skynet-utils/lib/data.js');

module.exports = {
  init: function(server) {
    server.register(require('inert'), (err) => {
        if (err) {
            LogUtil.log(err);
            return;
        }
        server.route({
          method: 'GET',
          path: '/meizu_get_vc_auth',
          handler: function(request, reply) {
            var referrer = request.info.referrer;
            var imei = request.query.imei;
            if(referrer && AuthUtil.isDomainOk(referrer)){
              var response = reply.response(Data.format(SettingUtil.isImeiOk(imei)));
              response.header('Access-Control-Allow-Origin', AuthUtil.getDomain(referrer));
              return response;
            }else{
              reply(Data.format({}, '未授权', 403));
            }
          }
        });
        server.route({
          method: 'GET',
          path: '/meizu_add_vc_auth',
          handler: function(request, reply) {
            var password = request.query.password,
                imei = request.query.imei;
            if(AuthUtil.isVcPasswordOk(password)){
              return SettingUtil.addImei(SettingUtil.imeiSettingKey, imei, reply);
            }
            reply(Data.format({}, '密码错误', 403));
          }
        });
        server.route({
          method: 'GET',
          path: '/meizu_clear_vc_auth',
          handler: function(request, reply) {
            var password = request.query.password,
                imei = request.query.imei;
            if(AuthUtil.isVcPasswordOk(password)){
              return SettingUtil.deleteImei(SettingUtil.imeiSettingKey, imei, reply);
            }
            reply(Data.format({}, '密码错误', 403));
          }
        });
        server.route({
          method: 'GET',
          path: '/meizu_get_vc_js',
          handler: function(request, reply) {
            var imei = request.query.imei;
            if(SettingUtil.isImeiOk(imei)){
              reply.file(Path.resolve(__dirname, '../test/vconsole.min.js'));
              return;
            }
            var response = reply.response('');
            response.header('Content-Type', 'application/javascript; charset=utf-8');
            return response;
            // reply.file(Path.resolve(__dirname, '../test/other.js'));
          }
        });
    });
  }
}
