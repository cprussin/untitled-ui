// Set up the environment.
var env    = process.argv[2] || 'development',
    config = require('./config.js')(env),
    spawn = require('child_process').spawn,
    ws     = require("nodejs-websocket");

// Runs a command, calling the given callback on it's response.
function run(cmd, args, cb) {
  var child = spawn(cmd, args), resp = '';
  child.stdout.on('data', (buffer) => resp += buffer.toString());
  child.stdout.on('end', () => cb(resp.trim()));
}

// Run the server.
ws.createServer(function (conn) {

  // Gets the current volume.
  function getVolume() {
    run('pamixer', ['--get-volume'], function(volume) {
      run('pamixer', ['--get-mute'], function(mute) {
        var str = 'volume ' + volume;
        if (mute === 'true') {str += ' mute';}
        conn.sendText(str);
      });
    });
  };

  // Sets the current volume.
  function setVolume(volume) {
    run('pamixer', ['--set-volume', volume], function() {
      getVolume();
    });
  };

  // Sets the current volume.
  function setMute(mute) {
    run('pamixer', mute ? ['--mute'] : ['--unmute'], function() {
      getVolume();
    });
  };

  // Handle incoming messages.
	conn.on('text', function (str) {
    console.log('Received: ' + str);
    if (str == 'get volume') {
      getVolume();
    } else if (str.startsWith('set volume')) {
      setVolume(str.split(' ').pop());
    } else if (str.startsWith('set mute')) {
      setMute(str.split(' ').pop() == 'true');
    }
	});
}).listen(config.port)
