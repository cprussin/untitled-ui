import E from 'ember';

export default E.Component.extend({
  windowManager: E.inject.service(),
  classNameBindings: 'side window.selectedLeaf'.w(),

  side: E.computed('window.selected', function() {
    if (!this.get('window.parent')) {return;}
    if (this.get('window.selected')) {return 'selected';}
    let index = this.get('window.parent.children').indexOf(this.get('window'));
    return index < this.get('windowManager.selectedIndex') ? 'left' : 'right';
  }),

  setupWebview: E.on('didInsertElement', function() {
    let webview = this.$('webview')[0];
    webview.addEventListener('loadstop', () => {
      this.get('window').setProperties({url: webview.src});
    });
  }),

  mouseMove() {
    this.get('windowManager').select(this.get('window'));
  }
});
