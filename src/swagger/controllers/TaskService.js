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
  var startTime = Date.parse(new Date());

  var param = args.task.value;
  var task = param.task;
  var projectId = param.projectId;
  
  TaskPersistence.insert(task, projectId).then(function(result){
    var err = result.err;
    
    if(err){
      logger.error(err.stack);
      throw new CError(3, ''); //currently, there is only db error. not set msg to client.
    }

    res.setHeader('Content-Type', 'application/json;charset=UTF-8');
    res.end(JSON.stringify({
      errCode: -1,
    }));

    var diff = Date.parse(new Date()) - startTime;
    logger.trace('insertTask: ' + diff);

  }).catch(function(e){
    EAction(res, e);
  });
}


exports.findTaskById = function(args, res, next) {
    var startTime = Date.parse(new Date());

    var param = args.id.value;
  
    TaskPersistence.findByIds([param]).then(function(result){
      var err = result.err;
      var task = result.tasks[0];

      if(err){
        logger.error(err.stack);
        throw new CError(3, ''); //currently, there is only db error. not set msg to client.
      }

      res.setHeader('Content-Type', 'application/json;charset=UTF-8');
      res.end(JSON.stringify({
        errCode: -1,
        task: task
      }));

      var diff = Date.parse(new Date()) - startTime;
      logger.trace('findTaskById: ' + diff);
    }).catch(function(e){
      EAction(res, e);
    });
}

exports.deleteTaskById = function(args, res, next) {
  var startTime = Date.parse(new Date());

  var id = args.id.value;
  var restore = args.restore.value;

  TaskPersistence.deleteById(id, restore).then(function(result){
      var err = result.err;

      if(err){
        logger.error(err.stack);
        throw new CError(3, ''); //currently, there is only db error. not set msg to client.
      }

      res.setHeader('Content-Type', 'application/json;charset=UTF-8');
      res.end(JSON.stringify({
        errCode: -1,
      }));

      var diff = Date.parse(new Date()) - startTime;
      logger.trace('deleteTaskById: ' + diff);

    }).catch(function(e){
      EAction(res, e);
    });

}


exports.updateTask = function(args, res, next) {
  var startTime = Date.parse(new Date());

  var taskId = args.id.value;
  var bodyParam = args.task.value;
  var task = bodyParam.task;
  var projectId = bodyParam.projectId;
  

  TaskPersistence.update(task, projectId).then(function(result){
      var err = result.err;

      if(err){
        logger.error(err.stack);
        throw new CError(3, ''); //currently, there is only db error. not set msg to client.
      }

      res.setHeader('Content-Type', 'application/json;charset=UTF-8');
      res.end(JSON.stringify({
        errCode: -1,
      }));

      var diff = Date.parse(new Date()) - startTime;
      logger.trace('updateTask: ' + diff);

    }).catch(function(e){
      EAction(res, e);
    });
}





