'use strict';
var moment = require('moment');
var EAction = require('../../exception.js').action;
var CError = require('../../exception.js').CError;
var logger = require('../../logger').logger('normal');
var TaskPersistence = require('../../persistence/task.js');

var AuthTest = require('./AuthTestService.js');

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


  AuthTest.getUserByToken(args).then(function(user){
    var creatorId = user.id;
    TaskPersistence.insert(task, projectId, creatorId).then(function(result){
      var err = result.err;
      
      if(err){
        logger.error(err.stack);
        throw new CError(3); //currently, there is only db error. not set msg to client.
      }

      res.setHeader('Content-Type', 'application/json;charset=UTF-8');
      res.end(JSON.stringify({
        errCode: -1,
      }));

      var diff = Date.parse(new Date()) - startTime;
      logger.trace('insertTask: ' + diff);
    })
  }, function(e){
    throw e;
  }).catch(function(e){
    EAction(res, e);
  })
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

exports._restoreById = function(id, res){
  var startTime = Date.parse(new Date());
  var restore = true;
  TaskPersistence.deleteById(id, restore).then(function(result){
    var err = result.err;
    if(err){
      logger.error(err.stack);
      throw new CError(3, ''); 
    }
    res.setHeader('Content-Type', 'application/json;charset=UTF-8');
    res.end(JSON.stringify({
      errCode: -1,
    }));

    var diff = Date.parse(new Date()) - startTime;
    logger.trace('_restoreTaskById: ' + diff);
  }, function(e){
    throw e;
  }).catch(function(e){
    EAction(res, e);
  });
}

exports.deleteTaskById = function(args, res, next) {
  var id = args.id.value;
  var restore = args.restore.value;
  if(restore){
    this._restoreById(id, res);
    return;
  }


  var startTime = Date.parse(new Date());

  this._authCheck(args).then(function(){

    TaskPersistence.deleteById(id).then(function(result){
      var err = result.err;

      if(err){
        logger.error(err.stack);
        throw new CError(3, ''); 
      }

      res.setHeader('Content-Type', 'application/json;charset=UTF-8');
      res.end(JSON.stringify({
        errCode: -1,
      }));

      var diff = Date.parse(new Date()) - startTime;
      logger.trace('deleteTaskById: ' + diff);
    }, function(e){
      throw e;
    }).catch(function(e){
      EAction(res, e);
    });

  }, function(e){
    throw e;
  }).catch(function(e){
    EAction(res, e);
  })
}

exports.updateTask = function(args, res, next) {
  var startTime = Date.parse(new Date());

  var taskId = args.id.value;
  var bodyParam = args.task.value;
  var task = bodyParam.task;
  var projectId = bodyParam.projectId;


  this._authCheck(args).then(function(){  

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

    }, function(e){
      throw e;
    }).catch(function(e){
      EAction(res, e);
    });

  }, function(e){
    throw e;
  }).catch(function(e){
    EAction(res, e);
  })
}

exports._authCheck = function(args){
    return Promise.all([
      AuthTest.getUserByToken(args),
      TaskPersistence.findByIds([args.id.value])
    ]) .then(function(param){
      var loginUser = param[0];
      var loginUserId = loginUser.id;

      var tasks = param[1].tasks;
      var err = param[1].err;
      if(err){
        logger.error(err.stack);
        throw err;
      }
      if(tasks.length === 0){ /*already deleted by a but b triger delete again.*/
        return Promise.resolve();
      }
       
      var creatorId = tasks[0].creatorId;
      if(loginUserId != creatorId){
        throw new CError(10);
      }
    }, function(e){
      throw e;
    }).catch(function(e){
      return Promise.reject(e);
    });
}




