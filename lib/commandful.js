  /*
 * commandful.js: creates Director CLI routers that map to resourceful resources
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var commandful = exports,
    resourceful = require('resourceful'),
    prompt = require('prompt'),
    colors = require('colors'),
    winston = require('winston'),
    welcome = require('./commandful/welcome'),
    director = require('director'),
    utile    = require('utile');

//
// Setup Winston logger
//
var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      colorize: true
    })
  ]
});
winston.setLevels(winston.config.npm.levels);
winston.addColors(winston.config.npm.colors);

//
// Base CRUD ( create / read / update / destroy ) methods that are expected,
// to exist on resourceful resource
//
var baseMethods = ['all', 'create', 'show', 'destroy', 'update', 'save'];

exports.createRouter = function (resource, options) {
  return new CommandfulRouter(resource, options);
};


var CommandfulRouter = exports.CommandfulRouter = function (resources, options) {
  options = options || {};

  if (!Array.isArray(resources)){
    resources = [resources];
  }

  //
  // CommandfulRouter inherits from director.cli.Router
  //
  director.cli.Router.call(this, options);

  this.resources = resources;
  this.strict = options.strict || false;
  exports.extendRouter(this, resources, options);
  
  //
  // Display help
  //

  //console.log(this.routes)

};

var extendRouter = exports.extendRouter = function (router, resources, options) {

  if (!Array.isArray(resources)){
    resources = [resources];
  }

  options.prefix  = options.prefix || '';
  options.strict  = options.strict || false;
  options.exposeMethods = options.exposeMethods || true;

  resources.forEach(function (resource) {
    var entity = resource._resource.toLowerCase(),
        param = options.param || ':id';
        //
        // Route for resource name itself.
        // Shows help / additional instructions for next level of commands
        //
        router.on(entity, function() {
          var args = utile.args(arguments),
              cmd = this.cmd.split(' ');

          cmd.shift();
          //
          // The root level of a resource,
          // show all immediate child commands
          //

          //
          // Show the welcome message
          //
          welcome.message().forEach(function(l){
            logger.info(l);
          })

          //
          // execute a specific method
          //
          logger.info('executing command:', cmd.join(' ').magenta);

          if(cmd.length === 1) {
            logger.info('The follow methods are available')
            for (var m in resource) {
              if(typeof resource[m] === "function" && ( resource[m].remote === true || baseMethods.indexOf(m) !== -1)) {
                var self = this;
                logger.info(' - ' + m.magenta)
              }
            }
          }
        });

        //
        // If we are going to expose Resource methods to the router interface
        //
        if (options.exposeMethods) {
          //
          // Find every function on the resource,
          // which has the "remote" property set to "true"
          //
          for (var m in resource) {
            if(typeof resource[m] === "function" && resource[m].remote === true) {
              var self = this;
              //
              // For every function we intent to expose remotely,
              // bind a GET and POST route to the method
              //
              (function(m){
                
                router.on(entity + ' ' + m, function(){
                  // console.log(m, arguments)
                });
              })(m)
            }
          }
        }
  });

  //
  // Dispatch argv on all routes
  //
  router.dispatch('on', process.argv.slice(2).join(' '));
  
  return router;
};

//
// Inherit from `director.http.Router`.
//
utile.inherits(CommandfulRouter, director.cli.Router);


//
// Name this `broadway` plugin.
//
exports.name = 'commandful';

//
// ### function init ()
// Initializes the `commandful` plugin with the App.
//
exports.init = function (done) {
  var app = this;

  if (app.resources) {
    //commandful.createServer(app.resources);
  }

  done();
};