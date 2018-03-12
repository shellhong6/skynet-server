const Mongoose = require('mongoose');
const LogUtil = require('@flyme/skynet-utils/lib/logUtil.js');
const Config = require('@flyme/skynet-db/lib/config.js');

var PREFIX = process.env.name && (process.env.name.indexOf('-test') == -1 ? 'mongodb://10.3.24.122:28028/' : 'mongodb://172.16.118.12:27017/');
PREFIX = process.argv[2] || PREFIX;
const POOLSIZE = parseInt(process.argv[3]);

//connection获取，实现connection复用
var conMap = {};
var getConnection = function(database, forceCreate, successFn){
  var con = conMap[database];
  if(con && !forceCreate){
    return con;
  }
  var uri = `${PREFIX}${database}?authSource=${Config.authsource}`;
  var options = {
    server: {
      socketOptions: {
        keepAlive: 300000,
        connectTimeoutMS: 30000
      }
    },
    user: Config.user,
    pass: Config.pass
  };
  POOLSIZE && (options.server.poolSize = POOLSIZE);
  con = Mongoose.createConnection(uri, options);
  con.on('error', function(err){
    LogUtil.error(`uri: ${uri},  time: ${new Date().toString()},  createConnection err: ${err.message}, poolSize: ${POOLSIZE}`);
  });
  con.on('connected', function(){
    successFn && successFn(database);
    LogUtil.log(`connected success, uri: ${uri},  time: ${new Date().toString()}, poolSize: ${POOLSIZE}`);
  });
  conMap[database] = con;
  return con;
};
var destroy = function(database){
  delete conMap[database];
};

//model获取，实现model复用
var modelMap = {};
var getModel = function(con, database, schema, forceCreate){
  var model = modelMap[database];
  if(!model && !forceCreate){
    model = con.model(database ,schema);
    modelMap[database] = model;
  }
  return model;
};

var dealErroring = {};
var dealError = function(database, schema, data, mes, type){
  if(mes.indexOf('server instance pool was destroyed') != -1){
    var temp = `${type}_${database}`;
    if(dealErroring[temp]){
      return;
    }
    dealErroring[temp] = true;
    var timeout = setTimeout(function(){
      dealErroring[temp] = false;
    }, 30000);
    fillWaitingMap(database, schema, data, type);
    getConnection(database, true, function(db){
      getModel(this, database, schema, true);
      dealErroring[`${type}_${db}`] = false;
      clearTimeout(timeout);
      methods[type](database, schema, getWaitingMap(database, schema, data, type));
      removeFromWaitingMap(database, schema, data, type);
    });
    destroy(database);
  }
};

//mongodb操作失败处理期间，数据存储并屏蔽正常的数据库操作
var justDealErroring = function(database, schema, data, type){
  var r = isDealErroring(database, schema, data, type);
  if(r){
    fillWaitingMap(database, schema, data, type);
  }
  return r;
};

//判断是否处于mongodb操作失败处理期间
var isDealErroring = function(database, schema, data, type){
  return dealErroring[`${type}_${database}`] == true;
};

//mongodb操作失败处理期间，未进入数据库的数据存储
var waitingMap = {};
var fillWaitingMap = function(database, schema, data, type){
  var list = waitingMap[`${type}_${database}`];
  if(!list){
    waitingMap[`${type}_${database}`] = [];
    list = waitingMap[`${type}_${database}`];
  }
  if(list.length > 50000){
    LogUtil.error(`database: ${database},  time: ${new Date().toString()},  type: ${type},  fillWaitingMap err: length greater than 50000`);
    return;
  }
  list.push(data);
};

//mongodb操作失败处理期间，未进入数据库的数据获取
var getWaitingMap = function(database, schema, data, type){
  return waitingMap[`${type}_${database}`];
};

//mongodb操作失败处理期间，未进入数据库的数据删除
var removeFromWaitingMap = function(database, schema, data, type){
  waitingMap[`${type}_${database}`] = [];
};

var methods = {
  save: function(database, schema, data){
    // if(!isOk(database)){
    //   return;
    // }
    if(justDealErroring(database, schema, data, 'save')){
      return;
    }
    var con = getConnection(database);
    var model = getModel(con, database ,schema);
    model.create(data, function(err){
      if(err){
        dealError(database, schema, data, err.message, 'save');
        LogUtil.error(`database: ${database},  time: ${new Date().toString()},  save err: ${err.message}`);
        return;
      }
    });
  },
  find: function(database, schema, conditions, callback, completeFn){
    var con = getConnection(database);
    var model = getModel(con, database ,schema);
    if(!callback && !completeFn){
      return model.find(conditions);
    }
    model.find(conditions, (err, r) => {
      if(err){
        completeFn && completeFn(err);
        LogUtil.error(`database: ${database},  time: ${new Date().toString()},  update-find err: ${err.message}`);
        return;
      }
      callback && callback(r);
      completeFn && completeFn(err);
    });
  },
  getList: function(database, schema, callback, opt){
      var con = getConnection(database);
      var model = getModel(con, database ,schema);
      var project = opt.project;
      var start = opt.start;
      var end = opt.end;
      var limit = opt.limit || 100;
      model.find({_project: project})
           .where('_time').gt(start).lt(end)
           .limit(limit).exec(function(err, res){
        if(err){
          LogUtil.error(`database: ${database},  time: ${new Date().toString()},  getList err: ${err.message}`);
          return;
        }
        callback(res);
      });
  },
  findOneAndUpdate: function(database, schema, data, conditions, callback){
    // if(!isOk(database)){
    //   return;
    // }
    if(justDealErroring(database, schema, data, 'findOneAndUpdate')){
      return;
    }
    var con = getConnection(database);
    var model = getModel(con, database ,schema);
    model.findOneAndUpdate(conditions, data, {upsert: true}, function(err){
      if(err){
        dealError(database, schema, data, err.message, 'findOneAndUpdate');
        LogUtil.error(`database: ${database},  time: ${new Date().toString()},  findOneAndUpdate err: ${err.message}`);
        return;
      }
      callback && callback();
    });
  }
};
module.exports = methods;
