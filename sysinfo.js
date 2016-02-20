/*jslint node: true */
"use strict";

// Include packages.
let Child = require('child_process'),
    Fs    = require('fs'),
    Net   = require('net'),
    RSVP  = require('rsvp'),
    Ws    = require('nodejs-websocket');

// Set up the environment.
let env         = process.argv[2] || 'development',
    config      = require('./config/environment.js')(env),
    connections = [];

// Run the UNIX socket server to watch for update requests.
let socket = Net.createServer((stream) => {
  stream.on('data', (str) => {
    str = str.toString();
    console.log('Received (Unix): ' + str);
    if (str === 'update network') {
      for (var connection of connections) {connection.getNetworks();}
    }
  });
});

// Handle EADDRINUSE.
socket.on('error', (e) => {
  if (e.code !== 'EADDRINUSE') {return;}

  // If nothing responds, then the server doesn't exist, so close the socket
  // and retry listening.
  let clientSocket = new Net.Socket();
  clientSocket.on('error', (error) => {
    if (error.code !== 'ENOENT' && error.code !== 'EADDRINUSE') {return;}
    Fs.unlinkSync(config.sysinfo.socket);
    socket.listen(config.sysinfo.socket);
  });

  // If something does respond, then the server is already running, so exit.
  clientSocket.connect({path: '/tmp/app-monitor.sock'}, () => {
    console.log('Server already running, exiting.');
    process.exit();
  });
});

// Listen on the socket file.
socket.listen(config.sysinfo.socket);

// Run the websocket server.
let websocket = Ws.createServer((conn) => {

  // Runs a command, calling the given callback on it's response.
  conn.run = (cmd) => {
    return new RSVP.Promise((resolve) => {
      let child = Child.spawn('sh', ['-c', cmd]), response = '';
      child.stdout.on('data', (buffer) => response += buffer.toString());
      child.stdout.on('end', () => resolve(response.trim()));
    });
  };

  // Sends a message to the client.
  conn.send = (message) => {
    let json = JSON.stringify(message);
    console.log('Sending: ' + json);
    conn.sendText(json);
  };

  // Gets the currently active network types, IP addresses, and SSIDs (if wifi).
  conn.getNetworks = () => {
    let cmd = "netstat -i | sed '1,2d' | grep -v lo | cut -f 1 -d ' '";
    conn.run(cmd).then((devices) => {
      RSVP.all(devices.split('\n').map((device) => {
        let ip = conn.run(`ip addr show ${device} | grep '\\binet\\b' |\
                           cut -d ' ' -f 6  | cut -d '/' -f 1`),
            wifi = conn.run(`iwconfig ${device} | head -n 1`);
        return RSVP.hash({ip: ip, wifi: wifi}).then((results) => {
          if (results.ip === '') {return null;}
          if (results.wifi === '') {
            results.type = 'ethernet';
          } else {
            results.type = 'wireless';
            results.ssid = results.wifi.split('"')[1];
          }
          delete results.wifi;
          return results;
        });
      })).then((results) => {
        results = results.filter((result) => result !== null);
        conn.send({message: 'networks', body: {networks: results}});
      });
    });
  };

  // Gets the current volume.
  conn.getVolume = () => {
    conn.run('pamixer --get-volume').then((volume) => {
      conn.run('pamixer --get-mute').then((mute) => {
        let body = {volume: volume, mute: mute === 'true'};
        conn.send({message: 'volume', body: body});
      });
    });
  };

  // Sets the current volume.
  conn.setVolume = (volume) => {
    conn.run('pamixer --set-volume ' + volume).then(conn.getVolume);
  };

  // Sets the current volume.
  conn.setMute = (mute) => {
    conn.run('pamixer ' + (mute ? ['--mute'] : ['--unmute'])).then(conn.getVolume);
  };

  // Handle incoming messages.
	conn.on('text', (str) => {
    console.log('Received (Web): ' + str);
    if (str === 'get volume') {
      conn.getVolume();
    } else if (str.startsWith('set volume')) {
      conn.setVolume(str.split(' ').pop());
    } else if (str.startsWith('set mute')) {
      conn.setMute(str.split(' ').pop() === 'true');
    } else if (str === 'get networks') {
      conn.getNetworks();
    }
	});

  // Track the connection.
  connections.push(conn);
  conn.on('close', () => {
    let index = connections.indexOf(conn);
    connections.splice(index, 1);
  });

// Set the port.
}).listen(config.sysinfo.websocket);

// Handle EADDRINUSE.
websocket.on('error', (e) => {
  if (e.code !== 'EADDRINUSE') {return;}
  console.log('Server already running, exiting.');
  process.exit();
});
