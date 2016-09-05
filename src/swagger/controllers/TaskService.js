'use strict';
var moment = require('moment');
var EAction = require('../../exception.js').action;
var CError = require('../../exception.js').CError;
var logger = require('../../logger').logger('normal');
var TaskPersistence = require('../../persistence/task.js');

exports.taskOptions = function(args, res, next) {
  res.end();
}
exports.taskOptions2 = function(args, res, next) {
  res.end();
}


exports.insertTask = function(args, res, next) {
  var param = args.task.value;
  
  TaskPersistence.insertTask(param).then(function(result){
    var err = result.err;
    
    if(err){
      logger.error(err.message);
      throw new CError(3, ''); //currently, there is only db error. not set msg to client.
    }

    res.setHeader('Content-Type', 'application/json;charset=UTF-8');
    res.end(JSON.stringify({
      errCode: -1,
    }));
  }).catch(function(e){
    EAction(res, e);
  });
}

exports.findTaskById = function(args, res, next) {
    var param = args.id.value;
  
    TaskPersistence.findTaskById(param).then(function(result){
      var err = result.err;
      var rows = result.rows;

      if(err){
        logger.error(err.message);
        throw new CError(3, ''); //currently, there is only db error. not set msg to client.
      }

      res.setHeader('Content-Type', 'application/json;charset=UTF-8');
      res.end(JSON.stringify({
        errCode: -1,
        task: rows[0]
      }));
    }).catch(function(e){
      EAction(res, e);
    });
}

