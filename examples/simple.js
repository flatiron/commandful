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
var cli = commandful.createRouter([fixtures.Creature, fixtures.Album, fixtures.Song]);
//
// Dispatch argv on all routes
//
cli.dispatch('on', process.argv.slice(2).join(' '));
