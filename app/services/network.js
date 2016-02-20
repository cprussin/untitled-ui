import E from 'ember';

export default E.Service.extend({
  socket: E.inject.service(),

  getNetworks: E.on('init', function() {
    E.run.later(() => {
      this.get('socket').register('networks', (message) => {
        this.setProperties(message);
      });
      this.get('socket').send('get networks');
    }, 1000);
  }),
});
