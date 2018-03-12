var mongoose = require('mongoose');
var jsErrorSchema = require('@flyme/skynet-db/lib/schema/jsErrorSchema.js');
var resourcesSchema = require('@flyme/skynet-db/lib/schema/resourcesSchema.js');
var memorySchema = require('@flyme/skynet-db/lib/schema/memorySchema.js');
var timingSchema = require('@flyme/skynet-db/lib/schema/timingSchema.js');
var pageSchema = require('@flyme/skynet-db/lib/schema/pageSchema.js');
var reportSchema = require('@flyme/skynet-db/lib/schema/reportSchema.js');
var projectSchema = require('@flyme/skynet-db/lib/manageSchema/projectSchema.js');
var db = require('./db.js');

var modelMap = {};
modelMap.timing = timingSchema;
modelMap.memory = memorySchema;
modelMap.jsError = jsErrorSchema;
modelMap.resources = resourcesSchema;
modelMap.report = reportSchema;
modelMap.page = pageSchema;

modelMap['manage-projects'] = projectSchema;

var methods = {
  save: function(type, project, data){
    db.save(`${type}-${project}`, modelMap[type], data);
  },
  find: function(type, project, conditions, callback, completeFn){
    return db.find(`${type}${project ? '-' + project : ''}`, modelMap[type], conditions, callback, completeFn);
  },
  savePerDay: function(type, project, data){
    var date = new Date();
    db.save(`${type}-${project}-${date.getFullYear()}${date.getMonth() + 1}${date.getDate()}`, modelMap[type], data);
  },
  getList: function(type, project, callback, opt){
    db.getList(`${type}-${project}`, modelMap[type], callback, opt);
  },
  findOneAndUpdate: function(type, project, data, conditions, callback){
    db.findOneAndUpdate(`${type}-${project}`, modelMap[type], data, conditions, callback);
  }
  // update: function(type, project, data, conditions, opt){
  //   db.update(`${type}-${project}`, modelMap[type], data, conditions, opt);
  // }
}

module.exports = methods;
