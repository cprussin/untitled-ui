import E from 'ember';

export default E.Component.extend({
  webviewUrl: E.computed('url', function() {
    return 'http://' + this.get('url');
  })
});
