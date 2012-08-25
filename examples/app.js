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
// Use the resourceful plugin and attach some resources
//
app.use(flatiron.plugins.resourceful);

app.resources = {
  Creature: fixtures.Creature,
  Album: fixtures.Album,
  Song: fixtures.Song
};

//
// Extend the app's router with commandful
//
app.use(commandful);

//
// We can also set custom routes, since it's just a `Director.Router` instance
//
app.router.on('foo', function(){
  app.log.info('a custom foo route.');
})

app.start(function (err) {
  if (err) {
    throw err;
  }
});
