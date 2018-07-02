const md5 = require('md5');

const domains = ['meizu.com', 'flyme.cn', 'mzres.com'];
const MD_PASSWORD = '067459b1607e0679a78a6403712948f3';

var app = {
  getDomain (referrer) {
    if(!referrer){
      return null;
    }
    var host = referrer.match(/^\w+:\/\/[^/]+/);
    if(!host || host.length < 1){
      return null;
    }
    return host[0];
  },
  getHost (referrer) {
    if(!referrer){
      return null;
    }
    var host = referrer.match(/:\/\/([^/]+)/);
    if(!host || host.length < 2){
      return null;
    }
    return host[1];
  },
  isDomainOk (referrer) {
    host = this.getHost(referrer);
    if(!host){
      return false;
    }
    for(var i = 0, ilen = domains.length; i < ilen; i++){
      if(host.indexOf(domains[i]) != -1){
        return true;
      }
    }
    return false;
  },
  isVcPasswordOk (password) {
    return md5(password) == MD_PASSWORD;
  }
};

module.exports = app;
