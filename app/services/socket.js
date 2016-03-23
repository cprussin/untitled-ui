import E from 'ember';
import config from 'ui/config/environment';

export default E.Service.extend({

  callbacks: E.Object.create(),
  messages: [],
  socket: new WebSocket(`ws://${config.sysinfo.host}:${config.sysinfo.websocket}`),

  setupSocket: E.observer('socket', function() {
    this.get('socket').onopen = () => this.sendMessages();
    this.get('socket').onmessage = (e) => this.receive(JSON.parse(e.data));
  }).on('init'),

  sendMessages() {
    this.get('messages').forEach((message) => this.send(message));
  },

  receive(message) {
    let fn = this.get('callbacks').get(message.message);
    if (typeof fn === 'function') {
      fn(message.body);
    }
  },

  send(message) {
    if (this.get('socket').readyState === 1) {
      this.get('socket').send(message);
    } else {
      this.get('messages').pushObject(message);
    }
  },

  register(message, fn) {
    this.get('callbacks').set(message, fn);
  }

});
