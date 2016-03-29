/* jshint node: true */
'use strict';

// Include packages.
let Child    = require('child_process');
let Fs       = require('fs');
let Net      = require('net');
let RSVP     = require('rsvp');
let Ws       = require('nodejs-websocket');
let Electron = require('electron');

let app            = Electron.app;
let BrowserWindow  = Electron.BrowserWindow;
let globalShortcut = Electron.globalShortcut;

let home        = `file://${__dirname}/dist/index.html`;
let environment = 'development';
let config      = require('./config/environment.js')(environment);

// Set up the environment.
let connections = [];
let win         = null;

function debug(message) {
  if (environment === 'debug') {
    console.log(message);
  }
}

// Set up the app.
app.on('window-all-closed', () => app.quit());
app.on('will-quit', () => globalShortcut.unregisterAll());
app.on('ready', () => {
  win = new BrowserWindow({title: 'ui'});
  delete win.module;
  win.setMenu(null);
  win.loadURL(home);
  win.webContents.on('did-fail-load', () => win.loadURL(home));
  win.on('closed', () => win = null);
  globalShortcut.register('VolumeUp',   () => win.webContents.send('volume', 'up'));
  globalShortcut.register('VolumeDown', () => win.webContents.send('volume', 'down'));
  globalShortcut.register('VolumeMute', () => win.webContents.send('volume', 'mute'));
});

// Run the UNIX socket server to watch for update requests.
let socket = Net.createServer((stream) => {
  stream.on('data', (str) => {
    str = str.toString();
    debug('Received (Unix): ' + str);
    if (str === 'update network') {
      for (let connection of connections) {connection.getNetworks();}
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
    debug('Server already running.');
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
    debug('Sending: ' + json);
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

  conn.isURL = (str) => {
    return new RegExp("^((https|http|ftp|rtsp|mms)?://)"
        + "?(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?" //ftp的user@
        + "(([0-9]{1,3}\.){3}[0-9]{1,3}" // IP形式的URL- 199.194.52.184
        + "|" // 允许IP和DOMAIN（域名）
        + "([0-9a-z_!~*'()-]+\.)*" // 域名- www.
        + "([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\." // 二级域名
        + "[a-z]{2,6})" // first level domain- .com or .museum
        + "(:[0-9]{1,4})?" // 端口- :80
        + "((/?)|" // a slash isn't required if there is no file name
        + "(/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+/?)$").test(str);
  }

  conn.search = (query) => {
    let urlquery = encodeURIComponent(query);
    let results = [{
      type: 'wikipedia',
      title: `Search Wikipedia for "${query}".`,
      url: `https://en.wikipedia.org/wiki/Special:Search?search=${urlquery}&go=Go`
    }, {
      type: 'google',
      title: `Search Google for "${query}".`,
      url: `https://www.google.com?hl=en&q=${urlquery}`
    }, {
      type: 'images',
      title: `Search Google Images for "${query}".`,
      url: `https://www.google.com/images?hl=en&q=${urlquery}`
    }, {
      type: 'maps',
      title: `Search Google Maps for "${query}".`,
      url: `https://www.google.com/maps?hl=en&q=${urlquery}`
    }, {
      type: 'youtube',
      title: `Search Youtube for "${query}".`,
      url: `https://www.youtube.com/results?search_query=${urlquery}`
    }];
    if (conn.isURL(query)) {
      results.unshift({
        type: 'exec',
        title: `Go to "${query}".`,
        url: query.startsWith('http') ? query : `http://${query}`
      });
    }
    conn.send({message: 'search-results', body: results});
  }

  // Send initial set of infos.
  conn.getVolume();
  conn.getNetworks();

  // Handle incoming messages.
  conn.on('text', (str) => {
    debug('Received (Web): ' + str);
    if (str === 'get volume') {
      conn.getVolume();
    } else if (str.startsWith('set volume')) {
      conn.setVolume(str.split(' ').pop());
    } else if (str.startsWith('set mute')) {
      conn.setMute(str.split(' ').pop() === 'true');
    } else if (str === 'get networks') {
      conn.getNetworks();
    } else if (str.startsWith('search')) {
      conn.search(str.split(' ').splice(1).join(' '));
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
  debug('Server already running.');
});
