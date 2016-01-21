"use strict";

// Set up the environment.
let env    = process.argv[2] || 'development',
    config = require('./config/environment.js')(env),
    spawn  = require('child_process').spawn,
    ws     = require("nodejs-websocket");

// Runs a command, calling the given callback on it's response.
function run(cmd) {
  return new Promise(function(resolve, reject) {
    let child = spawn('sh', ['-c', cmd]), resp = '';
    child.stdout.on('data', (buffer) => resp += buffer.toString());
    child.stdout.on('end', () => resolve(resp.trim()));
  });
}

// Run the server.
ws.createServer(function (conn) {

  // Sends a message to the client.
  function send(message) {
    var json = JSON.stringify(message);
    console.log('Sending: ' + json);
    conn.sendText(json);
  }

  // Gets the current volume.
  function getVolume() {
    run('pamixer --get-volume').then((volume) => {
      run('pamixer --get-mute').then((mute) => {
        let body = {volume: volume, mute: mute == 'true'};
        send({message: 'volume', body: body});
      });
    });
  };

  // Sets the current volume.
  function setVolume(volume) {
    run('pamixer --set-volume ' + volume).then(getVolume);
  };

  // Sets the current volume.
  function setMute(mute) {
    run('pamixer ' + (mute ? ['--mute'] : ['--unmute'])).then(getVolume);
  };

  // Handle incoming messages.
	conn.on('text', function (str) {
    console.log('Received: ' + str);
    if (str == 'get volume') {
      getVolume();
    } else if (str.startsWith('set volume')) {
      setVolume(str.split(' ').pop());
    } else if (str.startsWith('set mute')) {
      setMute(str.split(' ').pop() === 'true');
    }
	});

// Set the port.
}).listen(config.sysinfo.port);
