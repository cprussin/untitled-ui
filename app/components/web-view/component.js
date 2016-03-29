import E from 'ember';
import Window from 'ui/mixins/window';

export default E.Component.extend(Window, {
  classNameBindings: 'window.selected window.lastSelected'.w(),

  setupWebview: E.on('didInsertElement', function() {
    let webview = this.$('webview')[0];
    this.get('window').set('webview', webview);
    webview.addEventListener('did-start-loading', () => {
      this.get('window').set('title', 'Loading...');
    });
    webview.addEventListener('did-stop-loading', () => {
      this.get('window').set('title', webview.getTitle());
    });
    webview.addEventListener('new-window', (event) => {
      this.get('windowManager').launch(event.url, 'tabbed', {select: false});
    });
  })
});
