var Service = require('@flyme/skynet-db');
const Data = require('./data.js');
const LogUtil = require('@flyme/skynet-utils/lib/logUtil.js');

module.exports = {
  warnPageQueryPerDay(data, reply, fnName, conditions, sortParams, noFilter){
    
    Service.pageQuery(data.cur, data.pageSize, '', 'warnReport', data.time, conditions, sortParams, function(err, r){
      if(err){
        reply(Data.format({}, err.message));
        LogUtil.error(`projectName: warnReport-${data.time},  time: ${new Date().toString()}, ${fnName} err: ${err.message}`);
        return;
      }
      reply(Data.format(r));
    }, function(query){
      if(noFilter === true){
        return query;
      }
      return query.where('_reportServerTime').gt(data.query_start).lt(data.query_end);
    });
  }
}
