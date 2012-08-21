/*
 * defaultLogger.js: A default logger for use when one isn't passed to the
 * router (as in examples/simple.js).
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var winston = require('winston');

var logger = module.exports = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      colorize: true
    })
  ]
});

//
// Logging levels
//
var levels = {
  silly: 0,
  verbose: 1,
  info: 2,
  data: 4,
  warn: 4,
  debug: 5,
  error: 6
};

//
// Logging level colors
//
var colors = {
  silly: 'magenta',
  verbose: 'cyan',
  info: 'green',
  data: 'grey',
  warn: 'yellow',
  debug: 'blue',
  error: 'red'
};

winston.setLevels(levels);
winston.addColors(colors);