'use strict';
var moment = require('moment');
var EAction = require('../../exception.js').action;
var CError = require('../../exception.js').CError;
var logger = require('../../logger').logger('normal');
var Persistence = require('../../persistence/index.js');

exports.taskOptions = function(args, res, next) {
  res.end();
}

exports.addTask = function(args, res, next) {
  var param = args.task.value;
  
  Persistence.addTask(param).then(function(result){
    var err = result.err;
    
    if(err){
      logger.error(err.message);
      throw new CError(3, ''); //currently, there is only db error. not set msg to client.
    }

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      errCode: -1,
    }));
  }).catch(function(e){
    EAction(res, e);
  });
}
