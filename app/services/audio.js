import E from 'ember';

export default E.Service.extend({
  socket: E.inject.service(),

  getVolume: E.on('init', function() {
    this.get('socket').register('volume', (message) => {
      this.setProperties(message);
    });
  }),

  toggle() {
    this.get('socket').send('set mute ' + !this.get('mute'));
  },

  increase() {
    this.incrementProperty('volume', 5);
    if (this.get('volume') > 100) {this.set('volume', 100);}
    this.get('socket').send('set volume ' + this.get('volume'));
  },

  decrease() {
    this.decrementProperty('volume', 5);
    if (this.get('volume') < 0) {this.set('volume', 0);}
    this.get('socket').send('set volume ' + this.get('volume'));
  }
});
