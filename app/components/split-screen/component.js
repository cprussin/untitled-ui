import E from 'ember';

export default E.Component.extend({
  windowManager: E.inject.service(),
  classNameBindings: 'directionClass windows.selected'.w(),
  direction: 'tabbed',

  directionClass: E.computed('direction', 'windows.length', function() {
    return this.get('windows.length') > 1 ? this.get('direction') : 'tabbed';
  }),

  showTabs: E.computed('direction', 'windows.length', function() {
    return this.get('direction') === 'tabbed' && this.get('windows.length') > 1;
  }),

  actions: {
    select(window) {
      this.get('windowManager').select(window);
    }
  }
});
