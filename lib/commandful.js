/*
 * commandful.js: creates Director CLI routers that map to resourceful resources
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */

var commandful  = exports,
    resourceful = require('resourceful'),
    prompt      = require('prompt'),
    colors      = require('colors'),
    cliff       = require('cliff'),
    logger      = require('./commandful/defaultLogger'),
    director    = require('director'),
    utile       = require('utile'),
    argv        = require('optimist').argv;

//
// Set up prompt overrides with optimist.argv (default)
//
prompt.override = argv;

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

  options = options || {};

  if (!Array.isArray(resources)){
    resources = [resources];
  }

  options.prefix  = options.prefix || '';
  options.strict  = options.strict || false;
  options.exposeMethods = options.exposeMethods || true;

  var command = argv._.join(' ');

  if(command === "") {
    logger.info('the following resources are available');
    resources.forEach(function (resource) {
      logger.info(' - ' + resource.lowerResource.magenta)
    })
  } else {
    //
    // execute a specific method
    //
    logger.info('executing command:', command.magenta);
  }

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
      if(cmd.length === 1) {
        logger.info(resource.lowerResource.magenta + ' has the following methods:')
        for (var m in resource) {
          if(typeof resource[m] === "function" && ( resource[m].remote === true || baseMethods.indexOf(m) !== -1)) {
            var self = this;
            logger.info(' - ' + m.magenta)
          }
        }
      }
    });

    router.on(entity + ' create', function() {
      create(resource)
    });

    router.on(entity + ' show', function(id) {
      if(process.argv.slice(2).length === 2 ) {
        logger.warn('id'.magenta + ' is required is show')
        list(resource);
      }
    });

    router.on(entity + ' edit', function() {
      //
      // Remark: Bug in Director, see: https://github.com/flatiron/director/issues/134
      //
      if(process.argv.slice(2).length === 2 ) {
        logger.warn('id'.magenta + ' is required to edit')
        //
        // TODO: prompt y/n to list all ids
        //
      }
    });

    router.on(entity + ' edit :id', function(id) {
      resource.get(id, function(err, record){
        var schema = utile.clone(resource.schema);
        for(var p in record.properties) {
          if(typeof schema.properties[p] !== 'undefined') {
            schema.properties[p].default = record.properties[p];
          }
        }
        logger.info('editing ' + resource.lowerResource.magenta + ' ' + record.id);
        prompt.get(schema, function (err, result) {
          for(var p in result) {
            logger.info(p + '  :  ' + result[p]);
          }
          logger.info('about to save ' + resource.lowerResource.magenta);
          cliff.putObject(result);
          // TODO: Prompt y/n confirm
          result.id = record.id;
          resource.update(record.id, result, function(err, r){
            if(err) {
              return console.log('err', err)
            }
            logger.info('saved ' + resource.lowerResource.magenta + ' ' + r.id.grey)
          })
        });
      })
    });

    router.on(entity + ' show :id', function(id) {
      resource.get(id, function(err, result){
        if(err) {
          return console.log('err', err)
        }
        logger.info('showing ' + id.magenta);
        show(result, resource);
      });
    });

    router.on(entity + ' destroy', function() {
      //
      // Remark: Bug in Director, see: https://github.com/flatiron/director/issues/134
      //
      if(process.argv.slice(2).length === 2 ) {
        logger.warn('id'.magenta + ' is required to destroy')
        //
        // TODO: prompt y/n to list all ids
        //
      }
    });

    router.on(entity + ' destroy :id', function(id) {
      resource.get(id, function(err, record){
        if(err) {
          logger.error(id.magenta + ' not found')
          return;
        }
        var schema = utile.clone(resource.schema);
          logger.info('about to destroy ' + resource.lowerResource.magenta + ' ' + record.id);
          cliff.putObject(record);
          // TODO: Prompt y/n confirm
          resource.destroy(record.id, function(err, r){
            if(err) {
              return console.log('err', err)
            }
            logger.info('destroyed ' + ' ' + r.id.magenta)
          })
      })
    })

    router.on(entity + ' list', function() {
      resource.all(function(err, rows){
        if(err) {
          return console.log('err', err)
        }
        if (rows.length === 0) {
          logger.info('no ' + resource.lowerResource.magenta + ' found')
        } else {
          logger.info('showing all ' + resource.lowerResource.magenta);
          var lines = cliff.stringifyObjectRows(rows, Object.keys(resource.schema.properties), ['underline'], { columnSpacing: 5}).split('\n');
          lines.forEach(function(line){
            logger.info(line);
          })
        }
      })
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
  var resources,
      app = this;

  //
  // Use the app's logger instead of the default logger.
  //
  if (app.log) {
    logger = app.log;
  }

  //
  // Use the app's argv instead of the default optimist parse.
  //
  if (app.argv) {
    argv = app.argv;
    prompt.override = argv;
  }

  if (app.resources) {
    //
    // App.resources is an object right now, but commandful takes an /array/
    // of resources. This may be changed in the resourceful plugin, so this
    // code accepts both cases.
    //
    if (Array.isArray(app.resources)) {
      resources = app.resources;
    }
    else {
      resources = Object.keys(app.resources).map(function(k) {
        return app.resources[k];
      });
    }
    commandful.extendRouter(app.router, resources);
  }
  else {
    done(new Error('commandful flatiron plugin requires `flatiron.plugins.resourceful`.'));
  }

  done();
};

//
// TODO: move these to a configurable controller
//

function show (r, resource) {
  cliff.putObject(r);
};

function create (resource) {
  logger.info('prompting user for data');
  logger.info('define your new ' + resource.lowerResource.magenta)
  prompt.get(resource.schema, function (err, result) {
    logger.info('about to create ' + resource.lowerResource.magenta);
    cliff.putObject(result);
    // TODO: Prompt y/n confirm
    resource.create(result, function(err, r){
      if(err) {
        return console.log('err', err.validate)
      }
      logger.info('created new ' + resource.lowerResource.magenta + ' ' + r.id.grey)
    })
  });
};

function list (resource) {
  resource.all(function(err, result){
    result.forEach(function(record){
      logger.info(record.id);
    });
  });
};
