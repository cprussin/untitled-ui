import E from 'ember';

export default E.Service.extend({
  socket: E.inject.service(),

  results: [],

  handleResults: E.on('init', function() {
    this.get('socket').register('search-results', (message) => {
      this.set('results', message);
    });
  }),

  search(query) {
    this.get('socket').send(`search ${query}`);
  },

  clear() {
    this.set('results', []);
  }
});
