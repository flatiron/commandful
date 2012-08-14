/*
 * server.js: Simple http server with `commandful` router
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */
 
var fixtures    = require('../test/fixtures'),
    commandful     = require('../lib/commandful');

//
// Create a new command line on the defined resources
//
var cli = commandful.createRouter([fixtures.Creature, fixtures.Album]);

//cli.start();
