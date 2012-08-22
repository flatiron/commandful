var controller = exports;

var cliff  = require('cliff'),
    prompt = require('prompt');

controller.show = function (id, resource) {
  resource.get(id, function(err, result){
    if(err) {
      logger.error(JSON.stringify(err))
      return;
    }
    logger.info('showing ' + id.magenta);
    cliff.putObject(result);
  });
}

controller.list = function (resource) {
  logger.info('listing ' + resource.lowerResource.magenta)
  resource.all(function(err, rows){
    if(err) {
      logger.error(JSON.stringify(err))
      return;
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
};

controller.create = function (id, data, resource) {
  logger.warn('prompting user for data');
  if(typeof prompt.override.id !== 'undefined') {
    logger.info('define ' + prompt.override.id.magenta);
  } else {
    logger.info('define new ' + resource.lowerResource.magenta);
  }
  prompt.get(resource.schema, function (err, result) {
    if(err) {
      return;
    }
    logger.info('about to create ' + resource.lowerResource.magenta);
    cliff.putObject(result);
    resource.create(result, function(err, r){
      if(err) {
        logger.error(JSON.stringify(err))
        return;
      }
      logger.info('created new ' + resource.lowerResource.magenta + ' ' + r.id.grey)
    })
  });
};

controller.edit = function (id, resource) {
  resource.get(id, function(err, record) {
    if(err) {
      logger.error(JSON.stringify(err))
      return;
    }
    var schema = utile.clone(resource.schema);
    for(var p in record.properties) {
      if(typeof schema.properties[p] !== 'undefined') {
        schema.properties[p].default = record.properties[p];
      }
    }
    logger.info('editing ' + resource.lowerResource.magenta + ' ' + record.id);
    logger.warn('prompting user for data');
    prompt.get(schema, function (err, result) {
      if(err) {
        return;
      }
      logger.info('about to save ' + resource.lowerResource.magenta);
      cliff.putObject(result);
      result.id = record.id;
      confirm(function(err, promptResult){
        resource.update(record.id, result, function(err, r){
          if(err) {
            return logger.error(JSON.stringify(err))
          }
          logger.info('saved ' + resource.lowerResource.magenta + ' ' + r.id.grey)
        })
      });
    });
  });
};

controller.destroy = function (id, resource) {
  resource.get(id, function(err, record){
    if(err) {
      logger.error(JSON.stringify(err))
      return;
    }
    var schema = utile.clone(resource.schema);
    logger.info('about to destroy ' + resource.lowerResource.magenta + ' ' + record.id);
    cliff.putObject(record);
    confirm(function(err, promptResult){
      resource.destroy(record.id, function(err, r){
        if(err) {
          logger.error(JSON.stringify(err))
          return;
        }
        logger.info('destroyed' + ' ' + r.id.magenta)
      });
    });
  });
};

controller.remoteMethod = function (id, method, resource) {
  logger.info('attempting to ' + method.magenta + ' ' + id.magenta)
  resource[method](id, {}, function(err, result){
    if(err) {
      logger.error(JSON.stringify(err));
      return;
    }
    logger.data(result);
  });
};

//
// TODO: prompt actually has a built in prompt.confirm,
// its just not documented. Switch to using this and add usage docs to prompt library
//
function confirm (callback) {
  var property = {
    name: 'yesno',
    message: 'are you sure?',
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
