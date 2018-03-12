var Schedule = require('node-schedule');
const Service = require('@flyme/skynet-db');
const LogUtil = require('@flyme/skynet-utils/lib/logUtil.js');

Service.setOptions('occasional');

var app = {
  projects: []
};

function _dealProjects(){
  Service.find('manage-projects', '', {}, (r) => {
    LogUtil.log('begin projectUtils length:', r.length, ' ', new Date().toString());
    app.projects = [];
    r.forEach(function(item){
      app.projects.push(item.name);
    });
  }, function(err){
    err && LogUtil.error('projectUtils schedule error', new Date().toString());
  });
}

function _createJob(m){
  Schedule.scheduleJob(`0 */${m} * * * *`, _dealProjects);
}

_createJob(15);
_dealProjects();

module.exports = app;
