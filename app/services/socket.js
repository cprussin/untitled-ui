import E from 'ember';
import config from 'ui/config/environment';

export default E.Service.extend({
  messages: {},

  setup: E.on('init', function() {
    let socket = new WebSocket(config.sysinfo);
    socket.onmessage = (event) => {
      let data    = event.data.split(' '),
          body    = data.splice(1, data.length - 1),
          fn      = this.messages[data[0]];
      if (typeof fn === 'function') {
        fn(body);
      }
    };
    this.set('socket', socket);
  }),

  send(message) {
    let _this = this, fn = function() {_this.get('socket').send(message);};
    if (this.get('socket').readyState === 1) {
      fn();
    } else {
      this.get('socket').onopen = fn;
    }
  },

  register(message, fn) {
    this.messages[message] = fn;
  }
});
