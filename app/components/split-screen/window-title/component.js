import E from 'ember';

export default E.Component.extend({
  windowManager: E.inject.service(),
  classNameBindings: 'window.selected window.lastSelected'.w(),

  click() {
    this.get('windowManager').select(this.get('window'));
  },

  actions: {
    back() {
      this.get('windowManager.selected').back();
    },

    forward() {
      this.get('windowManager.selected').forward();
    },

    refresh() {
      this.get('windowManager.selected').reload();
    },

    close() {
      this.get('windowManager').close(this.get('window'));
    }
  }
});
