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
    controller  = require('./commandful/controller')
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
var baseMethods = ['all', 'create', 'get', 'destroy', 'update'];

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
        logger.info(resource.lowerResource.magenta + ' has the following actions:')
        for (var m in resource) {
          if(typeof resource[m] === "function" && ( resource[m].remote === true || baseMethods.indexOf(m) !== -1)) {
            var self = this;
            m = mappings[m] || m;
            logger.info(' - ' + m.magenta)
          }
        }
      }
    });

    router.on(entity + ' create', function() {
      //
      // Remark: Bug in Director, see: https://github.com/flatiron/director/issues/134
      //
      if(process.argv.slice(2).length === 2 ) {
        controller.create(null, {}, resource)
      }

    });

    router.on(entity + ' create :id', function(_id) {
      //
      // Remark: Bug in Director, see: https://github.com/flatiron/director/issues/134
      //
      if(process.argv.slice(2).length > 2 ) {
        prompt.override.id = _id;
        controller.create(_id, {}, resource)
      }
    });

    router.on(entity + ' show', function(id) {
      if(process.argv.slice(2).length === 2 ) {
        logger.warn('id'.magenta + ' is required is show')
        controller.list(resource);
      }
    });

    router.on(entity + ' show :id', function(id) {
      controller.show(id, resource);
    });

    router.on(entity + ' edit', function() {
      //
      // Remark: Bug in Director, see: https://github.com/flatiron/director/issues/134
      //
      if(process.argv.slice(2).length === 2 ) {
        logger.warn('id'.magenta + ' is required to edit')
        promptToList(resource, function(err, result){
          controller.list(resource);
        });
      }
    });

    router.on(entity + ' edit :id', function(id) {
      controller.edit(id, resource);
    });

    router.on(entity + ' destroy', function() {
      //
      // Remark: Bug in Director, see: https://github.com/flatiron/director/issues/134
      //
      if(process.argv.slice(2).length === 2 ) {
        logger.warn('id'.magenta + ' is required to destroy')
        promptToList(resource, function(err, result){
          controller.list(resource);
        });
      }
    });

    router.on(entity + ' destroy :id', function(id) {
      controller.destroy(id, resource);
    });

    router.on(entity + ' list', function() {
      controller.list(resource);
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
          (function(m){
            router.on(entity + ' ' + m, function(){
                //
                // Remark: Bug in Director, see: https://github.com/flatiron/director/issues/134
                //
                if(process.argv.slice(2).length === 2 ) {
                  logger.warn('id'.magenta + ' is required to ' + m.magenta)
                  promptToList(resource, function(err, result){
                    controller.list(resource);
                  });
                }
            });
            router.on(entity + ' ' + m + ' :id', function(_id) {
              controller.remoteMethod(_id, m, resource);
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

var mappings = {
  "all": "list",
  "update": "edit",
  "get": "show"
};

function promptToList (resource, callback) {
  var property = {
    name: 'yesno',
    message: 'list all ' + (resource.lowerResource + 's') + '?', // TODO: Fix inflection
    validator: /y[es]*|n[o]?/,
    warning: 'Must respond yes or no',
    default: 'yes'
  };
  prompt.get(property, function(err, result){
    if (err || result.yesno !== "yes") {
      logger.warn('action cancelled')
      return;
    }
    callback(null, result);
  });
}
