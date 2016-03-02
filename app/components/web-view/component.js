import E from 'ember';

export default E.Component.extend({
  windowManager: E.inject.service(),
  classNameBindings: 'window.selected window.lastSelected'.w(),

  setupWebview: E.on('didInsertElement', function() {
    let webview = this.$('webview')[0];
    let code = "window.addEventListener('message', function(e) {" +
               "  if (e.data.command == 'getTitle') {" +
               "    var message = {" +
               "      title: document.title," +
               `      id: '${this.get('elementId')}'` +
               "    };" +
               "    e.source.postMessage(message, e.origin);" +
               "  }" +
               "});";
    webview.addEventListener('loadstart', () => {
      this.get('window').set('title', 'Loading...');
    });
    webview.addEventListener('loadstop', () => {
      this.get('window').set('title', '');
    });
    webview.addEventListener('contentload', () => {
      this.get('window').set('uri', webview.src);
      webview.executeScript({code: code});
      webview.contentWindow.postMessage({command: 'getTitle'}, '*');
    });
    webview.addEventListener('newwindow', (event) => {
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
