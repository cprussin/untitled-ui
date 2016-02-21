import E from 'ember';

export default E.Component.extend({
  windowManager: E.inject.service(),
  classNameBindings: 'directionClass window.selected window.selectedLeaf'.w(),
  direction: 'tabbed',

  directionClass: E.computed('window.direction', 'window.children.length', function() {
    let multipleWindows = this.get('window.children.length') > 1;
    return multipleWindows ? this.get('window.direction') : 'tabbed';
  }),

  showTabs: E.computed('window.direction', 'window.children.length', function() {
    let tabbed = this.get('window.direction') === 'tabbed';
    return tabbed && this.get('window.children.length') > 1;
  }),

  indexOf(window) {
    return this.get('window.children').indexOf(window);
  },

  windowsLeft: E.computed('window.children.@each.selected', function() {
    let children = this.get('window.children');
    let selected = children.filterBy('selected').get('firstObject');
    let index = children.indexOf(selected);
    return new E.Handlebars.SafeString(`left: -${index * 100}%`);
  }),

  actions: {
    select(win) {
      this.get('windowManager').select(win);
    }
  }
});
