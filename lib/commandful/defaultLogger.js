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
winston.setLevels(winston.config.npm.levels);
winston.addColors(winston.config.npm.colors);
