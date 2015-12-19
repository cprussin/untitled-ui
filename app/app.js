import E from 'ember';
import Resolver from 'ember/resolver';
import loadInitializers from 'ember/load-initializers';
import config from './config/environment';

var App;

E.MODEL_FACTORY_INJECTIONS = true;

App = E.Application.extend({
  modulePrefix: config.modulePrefix,
  podModulePrefix: `${config.modulePrefix}/components`,
  Resolver: Resolver
});

loadInitializers(App, config.modulePrefix);

export default App;
