import E from 'ember';

export default E.Component.extend({
  windowManager: E.inject.service(),
  classNameBindings: 'window.selected window.lastSelected'.w(),

  setupWebview: E.on('didInsertElement', function() {
    let webview = this.$('webview')[0];
    webview.addEventListener('did-start-loading', () => {
      this.get('window').set('title', 'Loading...');
    });
    webview.addEventListener('did-stop-loading', () => {
      this.get('window').set('title', webview.getTitle());
    });
    webview.addEventListener('new-window', (event) => {
      this.get('windowManager').launch(event.targetUrl, 'tabbed');
    });
    this.set('message', (e) => {
      if (e.data.id !== this.get('elementId')) {return;}
      this.get('window').set('title', e.data.title);
    });
    window.addEventListener('message', this.get('message'));
  }),

  teardownEvents: E.on('willDestroy', function() {
    window.removeEventListener('message', this.get('message'));
  }),

  mouseMove() {
    if (this.get('window.parent.mode') === 'tabbed') {return;}
    this.get('windowManager').select(this.get('window'));
  }
});
