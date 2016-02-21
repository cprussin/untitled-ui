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

  actions: {
    select(win) {
      this.$('.windows').css({left: `-${this.indexOf(win) * 100}%`});
      this.get('windowManager').select(win);
    }
  }
});
