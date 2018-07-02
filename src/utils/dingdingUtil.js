var request = require('request');
var Service = require('@flyme/skynet-db');
var Schedule = require('node-schedule');
const LogUtil = require('@flyme/skynet-utils/lib/logUtil.js');

const DINGDING_URL = 'https://oapi.dingtalk.com/robot/send?access_token=11d60377b11bfde2538d4db0a41448e0f0b5558961684b78bf55f829c48ae0b8';

function _getWarnMarkdown(json){
  var url = `https://skynet.meizu.com/meizu_test_warnning_message?type=${json.type}&project=${json.project}&time=${json.time}`;
  return `### warning信息\n* project：${json.project}\n* type：${json.type}\n* [点击查看更多](${url}) \n\n> 请尽快处理\n\n> 相关责任人看到信息，请回复：会跟进\n\n> 已经开始着手处理，请回复：处理中\n\n> 处理完成，请回复：处理完`;
}

var _config = null;
function _createJob(m){
  Schedule.scheduleJob(`0 */${m} * * * *`, _clearConfig);
}
function _clearConfig(){
  _config = null;
}
_createJob(15);

function _getWarnSetting(callback){
  if(_config != null){
    callback(_config);
    return;
  }
  
  Service.find('manage-config', '', {name: 'warn_setting'}, (r) => {
    if(r && r.length){
      r = r[0]._doc;
      if(r.detail){
        callback(_config = JSON.parse(r.detail));
        return;
      }
    }
    callback(_config = {});
  }, function(err){
    err && LogUtil.error(`getWarnding find error, time: ${new Date()}`);
    err && callback(_config = {});
  });
}

var app = {
  sendWarnding(json) {
    LogUtil.log('begin sendWarnding!');
    var body = {
      "msgtype": "markdown",
      "markdown": {
         "title": 'warning!',
         "text": _getWarnMarkdown(json)
      },
      "at": {
        "atMobiles": [],
        "isAtAll": true
      }
    };

    _getWarnSetting(function(setting){
      request(
        {
          method: 'POST',
          url: setting[json.project] || DINGDING_URL,
          headers: {
            'content-type':'application/json; charset=utf-8'
          },
          body: JSON.stringify(body)
        },
        function(err, httpResponse, body) {
          if(err){
            LogUtil.error(`sendWarnding fail:`, err);
            return;
          }
          LogUtil.log(`sendWarnding success!`);
        }
      );
    });
  }
};

module.exports = app;
