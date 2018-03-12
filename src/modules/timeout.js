var pres = {}, curs = {}, dur = 1800000, callback = function(){}, timeout = null;
module.exports = {
  init: function(opt){
    opt.dur && (dur = opt.dur);
    opt.callback && (callback = opt.callback);
    return this;
  },
  setTime: function(db, time){
    pres[db] = curs[db] || time;
    curs[db] = time;
  },
  deal: function(db){
    var pre = pres[db] || 0,
        cur = curs[db] || 0;
    if(cur - pre > dur){
      callback && callback(db);
    }
  },
  start: function(){
    var me = this;
    clearTimeout(timeout);
    timeout = setTimeout(function(){
      for(var p in curs){
        me.deal(p);
      }
      me.start();
    }, dur);
    return this;
  }
};
