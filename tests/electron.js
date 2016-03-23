/* jshint undef: false */
/* jshint node: true */
'use strict';

const app           = require('app');
const BrowserWindow = require('browser-window');

let win = null;

app.on('window-all-closed', () => app.quit());

app.on('ready', () => {
  win = new BrowserWindow();
  delete win.module;
  win.setMenu(null);
  let dist = process.env.EMBER_ENV === 'test' ? '' : '/dist';
  win.loadUrl('file://' + __dirname + dist + '/index.html');
  win.on('closed', () => win = null);
});

/* jshint undef: true */
