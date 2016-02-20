import E from 'ember';
import config from 'ui/config/environment';

export default E.Service.extend({
  messages: {},

  setup: E.on('init', function() {
    let url    = `ws://${config.sysinfo.host}:${config.sysinfo.websocket}`,
        socket = new WebSocket(url);
    socket.onmessage = (event) => {
      let json = JSON.parse(event.data), fn = this.messages[json.message];
      if (typeof fn === 'function') { fn(json.body); }
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
