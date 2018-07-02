var Schedule = require('node-schedule');

var _map = {};

var app = {
  add(key, value) {
    _map[key] = value;
  },
  accumulate(key) {
    if(_map[key]){
      _map[key]++;
    }else{
      _map[key] = 1;
    }
  },
  get(key) {
    return _map[key];
  },
  getMap() {
    return _map;
  },
  clear(key) {
    delete _map[key];
  }
};

function _doAllClear(){
  _map = {};
}

function _createJob(h){
  Schedule.scheduleJob(`0 0 ${h} * * *`, _doAllClear);
}

_createJob(5);

module.exports = app;
