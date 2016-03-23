/* jshint node: true */
'use strict';

const electron      = require('electron');
const app           = electron.app;
const BrowserWindow = electron.BrowserWindow;
const home          = `file://${__dirname}/dist/index.html`;

let win = null;

app.on('window-all-closed', () => app.quit());

app.on('ready', () => {
  win = new BrowserWindow();
  delete win.module;
  win.setMenu(null);
  win.loadURL(home);
  win.webContents.on('did-fail-load', () => win.loadURL(home));
  win.on('closed', () => win = null);
});
