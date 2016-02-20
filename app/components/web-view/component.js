import E from 'ember';

export default E.Component.extend({
  windowManager: E.inject.service(),
  classNameBindings: 'window.selected:selected',

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
