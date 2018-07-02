(function(){
    window.notifyDownProgress = function() {};
    window.onWindowChanged = function() {};
    window.onWindowHide = function() {};
    window.notifyActivityState = function() {}; //屏蔽报错
    var prefix = '//skynet.meizu.com';
    var db_timing = 'timing';
    var db_memory = 'memory';
    var db_jserror = 'jsError';
    var db_resources = 'resources';
    var resMap = {};
    var resourcesMaxTime = 0;
    var el = null;
    var mzJi = window.MzJavascriptInterface;
    var eJi = window.EventJavascriptInterface;
    var methods = {
      getAttr: function(key){
        !el && (el = document.querySelector('script[data-type="skynet"]'));
        if(el){return el.getAttribute('data-' + key);}
        return 'unknow'
      },
      addBaseData: function(o){
        var imei = window.getImei ? window.getImei(): '';
        o._page = location.origin + location.pathname;
        o._imei = imei;
        return o;
      },
      addToResMap: function(item){
        var key = item.type + '_' + item.name,
            one = resMap[key];
        item.dur < 0 && (item.dur = 0);
        if(!one){
          resMap[key] = item;
          resMap[key].amount = 1;
        }else{
          one.amount ++;
          one.dur += item.dur;
        }
      },
      getArrFromResMap: function(){
        var arr = [];
        for(var p in resMap){
          if(resMap.hasOwnProperty(p)){
            resMap[p].dur = parseInt(resMap[p].dur);
            arr.push(resMap[p]);
          }
        }
        return arr;
      },
      transResources: function(l){
        var me = this, arr = window.performance.getEntries(), r = [], startTimes = [], name = '';
        arr.forEach(function(item){
          if(item.startTime > resourcesMaxTime){
            name = item.name;
            name = name.match(/^\w+:\/\/([^?&#/]+)/);
            name = (name && name.length > 1) ? name[1] : 'unknow';
            startTimes.push(item.startTime);
            me.addToResMap({
              type: item.initiatorType || item.entryType,
              name: name,
              dur: item.duration
            });
          }
        });
        if(resourcesMaxTime.length){
          resourcesMaxTime = startTimes.sort(function(a,b){return b-a;})[0];
        }
        return this.getArrFromResMap();
      },
      transTiming: function(){
        var t = window.performance.timing;
        return {
          ce: t.connectEnd,
          cs: t.connectStart,
          dc: t.domComplete,
          dcle: t.domContentLoadedEventEnd,
          dcls: t.domContentLoadedEventStart,
          di: t.domInteractive,
          dl: t.domLoading,
          dle: t.domainLookupEnd,
          dls: t.domainLookupStart,
          fs: t.fetchStart,
          le: t.loadEventEnd,
          ls: t.loadEventStart,
          ns: t.navigationStart,
          re: t.redirectEnd,
          rs: t.redirectStart,
          reqs: t.requestStart,
          reqe: t.requestEnd,
          rese: t.responseEnd,
          ress: t.responseStart,
          scs: t.secureConnectionStart,
          uee: t.unloadEventEnd,
          ues: t.unloadEventStart,
          _search: location.search
        };
      },
      transMomery: function(){
        var m = window.performance.memory;
        return {
          limit: m.jsHeapSizeLimit,
          total: m.totalJSHeapSize,
          used: m.usedJSHeapSize
        };
      },
      getTiming: function(){
        var timing = this.transTiming();
        this.addBaseData(timing);
        return {
          data: timing,
          type: db_timing,
          project: _MONITOR.params.project
        };
      },
      getResources: function(){
        var entries = this.transResources();
        return {
          data: this.addBaseData({list: entries}),
          type: db_resources,
          project: _MONITOR.params.project
        };
      },
      getMemory: function(){
        var memory = this.transMomery();
        this.addBaseData(memory);
        return {
          data: memory,
          type: db_memory,
          project: _MONITOR.params.project
        };
      },
      getJsError: function(err){
        var jsError = {
          name: err.name,
          message: err.message,
          stack: err.stack
        };
        this.addBaseData(jsError);
        delete jsError._id;
        return {
          data: jsError,
          type: db_jserror,
          project: _MONITOR.params.project
        };
      },
      request: function(url) {
          var img = new Image();
          img.src = url;
      },
      save: function(paramsStr){
        this.request(prefix + '/save?q=' + encodeURIComponent(paramsStr));
      },
      baseReport: function(action, paramsStr){
        this.request(prefix + '/' + action + '?q=' + encodeURIComponent(paramsStr));
      },
      report: function(paramsStr){
        this.baseReport('report', paramsStr);
      },
      androidReport: function(paramsStr){
        this.baseReport('androidReport', paramsStr);
      },
      warnReport: function(paramsStr){
        this.baseReport('warnReport', paramsStr);
      },
      saveByType: function(type, data){
        var methodyType = type.charAt(0).toUpperCase() + type.substr(1),
            json = this['get' + methodyType](data);
        if(json == null){
          return;
        }
        this.save(JSON.stringify(json));
      },
      jsError: function(){
        var me = this;
        window.onerror = function(err) {
          me.saveByType(db_jserror, arguments[4]);
        };
      },
      when: function(conFunc, proFunc){
        var me = this;
        if(this.when._limit === undefined){
          this.when._limit = 10;
        }
        if(this.when._limit < 0){
          this.when._limit = 10;
          return;
        }
        if(conFunc()){
          proFunc();
          this.when._limit = 10;
        }else{
          setTimeout(function(){
            me.when(conFunc, proFunc);
          }, 100 * this.when._limit);
        }
      }
    };
    window._MONITOR = {
      autoReport: methods.getAttr('auto') != 'false',
      support: '',
      params: {
        'project': methods.getAttr('project')
      },
      save: function(type){
        methods.saveByType(type);
      },
      setEndTime: function(t){
        window.performance.timing.end = t;
      },
      isPerformance: function(){
        if(!window.performance){
          this.support += 'p';
          return false;
        }
        return true;
      },
      reportBase: function(){
        if(!this.isPerformance()){
          return;
        }
        if(this.isLoad()){
          this.setEndTime(new Date().getTime());
          if(window.performance.timing){
            this.save(db_timing);
          }else{
            this.support += 't';
          }
          if(window.performance.memory){
            this.save(db_memory);
          }else{
            this.support += 'm';
          }
        }
      },
      reportResources: function(){
        if(!this.isPerformance()){
          return;
        }
        if(this.isLoad()){
          if(window.performance.getEntries()){
            this.save(db_resources);
          }else{
            this.support += 'r';
          }
        }
      },
      doReport: function(data){
        methods.report(JSON.stringify({
          project: window._MONITOR.params.project,
          data: data
        }));
      },
      doAndroidReport: function(data, apiName){
        methods.androidReport(JSON.stringify({
          project: window._MONITOR.params.project,
          apiName: apiName,
          message: data.message,
          stack: data.stack
        }));
      },
      doWarnReport: function(type, detail){
        methods.warnReport(JSON.stringify({
          project: window._MONITOR.params.project,
          type: type,
          detail: detail
        }));
      },
      isLoad: function(){
        if(!window._MONITOR.hasLoad){
          window._MONITOR.autoReport = true;
          return false;
        }
        return true;
      },
      doBrowserReport: function(){
        if(methods.getAttr('bro') != 'true'){
          return;
        }
        methods.report('{"project":"' + methods.getAttr('project') + '","data":{"baseInfo":"bro-type","otherInfo":"' + this.getBrowserType() + '"}}');
      },
      getBrowserType: function(){
        var business = 'other';
        if(mzJi && mzJi.isMzBrowser && mzJi.isMzBrowser()){
          business = 'mzBrowser';
        }else if(eJi && eJi.onInstallButtonClick){
          business = 'appstore';
        }else if((/micromessenger/i).test(navigator.userAgent)){
          business = 'weixin';
        }
        return business;
      },
      doSupportReport: function(){
        if(this.support.length){
          methods.report('{"project":"' + methods.getAttr('project') + '","data":{"baseInfo":"support","otherInfo":"' + this.support + '/' + navigator.userAgent + '"}}');
        }
      }
    };
    methods.jsError();
    window.onload = function(){
      var monitor = window._MONITOR;
      monitor.hasLoad = true;
      if(monitor.autoReport){
        methods.when(function(){
          return window.performance.timing.loadEventEnd != 0;
        }, function(){
          monitor.reportBase();
          monitor.reportResources();
          monitor.doSupportReport();
        });
        monitor.doBrowserReport();
      }
    };
    window.getImei = function(){
      if(eJi && eJi.getIMEI){
        return eJi.getIMEI();
      }
      if(mzJi && mzJi.getIMEI){
        return mzJi.getIMEI();
      }
      return 'unknow';
    };
  })();
