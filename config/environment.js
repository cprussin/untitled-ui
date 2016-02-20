/* jshint node: true */

module.exports = function(environment) {
  var ENV = {
    APP: {},
    EmberENV: {FEATURES: {}},
    modulePrefix: 'ui',
    environment: environment,
    sysinfo: {
      host: 'localhost',
      websocket: 6969,
      socket: '/run/user/1000/ui'
    }
  };

  if (environment === 'test') {
    ENV.baseURL = '/';
    ENV.locationType = 'none';
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;
    ENV.APP.rootElement = '#ember-testing';
  }

  if (environment === 'development') {
  }

  if (environment === 'production') {
  }

  return ENV;
};
