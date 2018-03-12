const Service = require('@flyme/skynet-db');
const ProjectUtils = require('../utils/projectUtil.js');
const LogUtil = require('@flyme/skynet-utils/lib/logUtil.js');

Service.setOptions('frequent');

const dealData = function(json){
  var data = json.data;
  data._reportServerTime = Date.now();
  try{
    data._page && (data._page = decodeURIComponent(data._page));
  }catch(err){
    LogUtil.printFirstError(err.message, data._page);
  }
  try{
    data._search && (data._search = decodeURIComponent(data._search));
  }catch(e){
    data._search = '';
  }
  switch (json.type) {
    case 'resources':
      data.list.map(function(item){
        item.name = decodeURIComponent(item.name);
        return item;
      });
      data.list = JSON.stringify(data.list);
      break;
    default:;
  };
};

module.exports = {
  init(server){
    server.route({
      method: 'GET',
      path: '/save',
      handler: (request, reply) => {
        var jsonStr = request.query.q;
        var json = null, type = '', project = '', data;
        try{
          json = JSON.parse(jsonStr);
        }catch(err){
          LogUtil.printFirstError(err.message, request.url.search);
          LogUtil.error(err.stack);
          return;
        }
        type = json.type;
        project = json.project;
        if(ProjectUtils.projects.indexOf(project) != -1){
          dealData(json);
          data = json.data;
          Service.savePerDay(type, project, data);
        }
        reply('');
      }
    });
    server.route({
      method: 'GET',
      path: '/report',
      handler: (request, reply) => {
        var jsonStr = request.query.q;
        var json = null, project = '', data;
        try{
          json = JSON.parse(jsonStr);
        }catch(err){
          LogUtil.error(err.stack);
          return;
        }
        project = json.project;
        if(ProjectUtils.projects.indexOf(project) != -1){
          dealData(json);
          data = json.data;
          Service.save('report', project, data);
        }
        reply('');
      }
    });
    server.route({
      method: 'GET',
      path: '/androidReport',
      handler: (request, reply) => {
        var jsonStr = request.query.q;
        var json = null, project = '', data;
        try{
          json = JSON.parse(jsonStr);
        }catch(err){
          LogUtil.error(err.stack);
          return;
        }
        project = json.project;
        if(ProjectUtils.projects.indexOf(project) != -1){
          var result = {
            data: json
          };
          dealData(result);
          Service.savePerDay('androidReport', '', result.data);
        }
        reply('');
      }
    });
  }
}
