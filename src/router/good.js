const Good = require('good');
module.exports = {
  init: function(server) {
    server.register({
      register: Good
      // options: {
      //   reporters: {
      //     // console: [{
      //     //   module: 'good-squeeze',
      //     //   name: 'Squeeze',
      //     //   args: [{
      //     //     response: '*',
      //     //     log: '*'
      //     //   }]
      //     // }, {
      //     //   module: 'good-console'
      //     // }, 'stdout'],
      //     // consoleFile: [{
      //     //     module: 'good-squeeze',
      //     //     name: 'Squeeze',
      //     //     args: [{ log: '*' }]
      //     // }, {
      //     //     module: 'good-squeeze',
      //     //     name: 'SafeJson',
      //     //     args: [
      //     //         null,
      //     //         { separator: ',' }
      //     //     ]
      //     // }, {
      //     //     module: 'rotating-file-stream',
      //     //     args: [
      //     //         'ops_log',
      //     //         {
      //     //             size: '1GB',
      //     //             path: './logs/console/'
      //     //         }
      //     //     ]
      //     // }],
      //     // errorsFile: [{
      //     //     module: 'good-squeeze',
      //     //     name: 'Squeeze',
      //     //     args: [{error: '*'}]
      //     // }, {
      //     //     module: 'good-squeeze',
      //     //     name: 'SafeJson',
      //     //     args: [
      //     //         null,
      //     //         { separator: ',' }
      //     //     ]
      //     // }, {
      //     //     module: 'rotating-file-stream',
      //     //     args: [
      //     //         'errors_log',
      //     //         {
      //     //             size: '1GB',
      //     //             path: './logs/errors/'
      //     //         }
      //     //     ]
      //     // }],
      //     opsFile: [{
      //       module: 'good-squeeze',
      //       name: 'Squeeze',
      //       args: [{
      //         ops: '*'
      //       }]
      //     }, {
      //       module: 'good-squeeze',
      //       name: 'SafeJson',
      //       args: [
      //         null, {
      //           separator: ','
      //         }
      //       ]
      //     }, {
      //       module: 'rotating-file-stream',
      //       args: [
      //         'ops_log', {
      //           size: '1GB',
      //           path: '/data/logs/node/ops/'
      //         }
      //       ]
      //     }]
      //   }
      // }
    }, (err) => {
      if (err) {
        throw err; // something bad happened loading the plugin
      }
      server.start((err) => {
        if (err) {
          throw err;
        }
        server.log('info', 'Server running at: ' + server.info.uri);
      });
    });
  }
}
