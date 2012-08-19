/*
 * server.js: Simple http server with `commandful` router
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */
 
var fixtures    = require('../test/fixtures'),
    commandful  = require('../lib/commandful'),
    flatiron    = require('flatiron');

//
// Create a new flatiron app
//
var app = new flatiron.App;

//
// Use the flatiron cli plugin
//
app.use(flatiron.plugins.cli);

//
// Extend the app's router with commandful
//
commandful.extendRouter(app.router, [fixtures.Creature, fixtures.Album]);

app.start(function (err) {
  if (err) {
    throw err;
  }
});
