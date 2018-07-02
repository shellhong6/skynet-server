const Service = require('@flyme/skynet-db');
const LogUtil = require('@flyme/skynet-utils/lib/logUtil.js');
const Async = require('async');
const Data = require('@flyme/skynet-utils/lib/data.js');
var Schedule = require('node-schedule');

// const ALLOW_ORIGIN = 'http://skynet.meizu.com';

var app = {
  imeiSettingKey: 'imei_setting',
  imeiMap: {},
  addImei (key, imei, reply) {
    return new Promise((resolve, reject) => {
      Async.series(
        [
          function(callback){
            _getImeiSetting(callback);
          }
        ],
        (err, results) => {
          this.imeiMap[imei] = true;
          if(!err){
            if(results && results.length > 0 && results[0]){
              
              Service.findOneAndUpdate('manage-config', '', {name: this.imeiSettingKey, detail: Object.keys(this.imeiMap).join(',')}, {_id: results[0]}, () => {
                // reply(Data.format('', '设置成功'));
                var response = reply.response(Data.format('', '设置成功'));
                // response.header('Access-Control-Allow-Origin', ALLOW_ORIGIN);
                resolve(response);
              }, function(err){
                err && reply(Data.format('', '设置失败', 500));
              });
            }else{
              
              Service.save('manage-config', '', {
                name: this.imeiSettingKey,
                detail: Object.keys(this.imeiMap).join(',')
              }, function(){
                var response = reply.response(Data.format('', '设置成功'));
                // response.header('Access-Control-Allow-Origin', ALLOW_ORIGIN);
                resolve(response);
                // reply(Data.format('', '设置成功'));
              }, function(err){
                if(err){
                  var response = reply.response(Data.format('', '设置失败', 500));
                  // response.header('Access-Control-Allow-Origin', ALLOW_ORIGIN);
                  resolve(response);
                }
                // err && reply(Data.format('', '设置失败', 500));
              });
            }
          }
        }
      );
    });
  },
  deleteImei (key, imei, reply) {
    return new Promise((resolve, reject) => {
      Async.series(
        [
          function(callback){
            _getImeiSetting(callback);
          }
        ],
        (err, results) => {
          if(!err){
            if(results && results.length > 0 && results[0]){
              if(imei == 'all'){
                this.imeiMap = {};
              }else{
                delete this.imeiMap[imei];
              }
              
              Service.findOneAndUpdate('manage-config', '', {name: this.imeiSettingKey, detail: Object.keys(this.imeiMap).join(',')}, {_id: results[0]}, () => {
                // reply(Data.format('', '设置成功'));
                var response = reply.response(Data.format('', '设置成功'));
                // response.header('Access-Control-Allow-Origin', ALLOW_ORIGIN);
                resolve(response);
              }, function(err){
                if(err){
                  var response = reply.response(Data.format('', '设置失败', 500));
                  // response.header('Access-Control-Allow-Origin', ALLOW_ORIGIN);
                  resolve(response);
                }
                // err && reply(Data.format('', '设置失败', 500));
              });
            }else{
              this.imeiMap = {};
              var response = reply.response(Data.format('', '设置成功'));
              // response.header('Access-Control-Allow-Origin', ALLOW_ORIGIN);
              resolve(response);
              // reply(Data.format('', '设置成功'));
            }
          }
        }
      );
    });
  },
  isImeiOk (imei) {
    if(!imei){
      return false;
    }
    return !! this.imeiMap[imei];
  }
};

function _getImeiSetting(callback){
  
  Service.find('manage-config', '', {name: app.imeiSettingKey}, (r) => {
    if(r && r.length){
      r = r[0]._doc;
      app.imeiMap = {};
      if(r.detail != ''){
        r.detail.split(',').forEach(function(item){
          app.imeiMap[item] = true;
        });
      }
    }
    callback && callback(null, r._id);
  }, function(err){
    err && LogUtil.error(`get imei_setting find error, time: ${new Date()}`);
    err && callback && callback(err);
  });
}
function _createJob(m){
  Schedule.scheduleJob(`0 */${m} * * * *`, _getImeiSetting);
}
_getImeiSetting();
_createJob(15);

module.exports = app;
