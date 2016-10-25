'use strict';
var moment = require('moment');
var EAction = require('../../exception.js').action;
var CError = require('../../exception.js').CError;
var logger = require('../../logger').logger('normal');
var ProjectPersistence = require('../../persistence/project.js');
var AuthTest = require('./AuthTestService.js');

exports.projectOptions = function(args, res, next) {
  res.end();
}
exports.projectOptions2 = function(args, res, next) {
  res.end();
}

exports.findProjects = function(args, res, next) {
  //how to get user?
  var userId = args.userId.value;
  var offset = args.offset.value;
  var limit = args.limit.value;
  var param = {
    userId: userId,
    offset: offset,
    limit: limit
  }



  var startTime = Date.parse(new Date());
  ProjectPersistence.findProjects(param).then(function(result){
    var err = result.err;
    var projects = result.projects;
    var count = result.count;

    if(err){
      logger.error(err.stack);
      throw new CError(3, '');
    } 

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      errCode: -1,
      projects: projects,
      count: count,
    }));

    var diff = Date.parse(new Date()) - startTime;
    logger.trace('findProjects: ' + diff);

  }).catch(function(e){
    EAction(res, e);
  });
}

exports.findProjectById = function(args, res, next) {
  var startTime = Date.parse(new Date());

  var id = args.id.value;
  ProjectPersistence.findProjectById(id).then(function(result){
    var err = result.err;
    var project = result.project;

    if(err){
      logger.error(err.stack);
      throw new CError(3, '');
    } 

    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        errCode: -1,
        project: project
      })
    );

    var diff = Date.parse(new Date()) - startTime;
    logger.trace('findProjectById: ' + diff);
  }).catch(function(e){
    EAction(res, e);
  });
}

exports.insertProject = function(args, res, next) {
  var startTime = Date.parse(new Date());

  var param = args.project.value;
  AuthTest.getUserByToken(args).then(function(user){
    var creatorId = user.id;

    ProjectPersistence.insertProject(param, creatorId).then(function(result){
      var err = result.err;
      
      if(err){
        logger.error(err.stack);
        throw new CError(3, ''); //currently, there is only db error. not set msg to client.
      }

      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        errCode: -1,
        //projectId: projectId,  //return project json.
      }));

      var diff = Date.parse(new Date()) - startTime;
      logger.trace('insertProject: ' + diff);

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
exports._restoreById = function(id, res){
  var startTime = Date.parse(new Date());
  var restore = true;
  ProjectPersistence.deleteProjectById(id, restore).then(function(result){
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
    logger.trace('_restoreProjectById: ' + diff);
  }, function(e){
    throw e;
  }).catch(function(e){
    EAction(res, e);
  });
}

exports.deleteProjectById = function(args, res, next) {
  var id = args.id.value;
  var restore = args.restore.value;
  if(restore){
    this._restoreById(id, res);
    return;
  }

  var startTime = Date.parse(new Date());

  this._authCheck(args).then(function(){


    ProjectPersistence.deleteProjectById(id).then(function(result){
      var err = result.err;
      
      if(err){
        logger.error(err.stack);
        throw new CError(3, ''); //currently, there is only db error. not set msg to client.
      }

      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        errCode: -1,
        //projectId: projectId,  //return project json.
      }));

      var diff = Date.parse(new Date()) - startTime;
      logger.trace('deleteProjectById: ' + diff);

    }).catch(function(e){
      EAction(res, e);
    });




  }, function(e){
    throw e;
  }).catch(function(e){
    EAction(res, e);
  })
}
exports.updateProject = function(args, res, next) {
  var startTime = Date.parse(new Date());

  var projectId = args.id.value;
  var project = args.project.value;


  this._authCheck(args).then(function(){  

      ProjectPersistence.update(project).then(function(result){
        var err = result.err;
        
        if(err){
          logger.error(err.stack);
          throw new CError(3, ''); //currently, there is only db error. not set msg to client.
        }

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          errCode: -1,
          //projectId: projectId,  //return project json.
        }));

        var diff = Date.parse(new Date()) - startTime;
        logger.trace('updateProject: ' + diff);
        
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
      ProjectPersistence.findProjectById(args.id.value)
    ]) .then(function(param){
      var loginUser = param[0];
      var loginUserId = loginUser.id;

      var project = param[1].project;
      var err = param[1].err;
      if(err){
        logger.error(err.stack);
        throw err;
      }
      if(!project){
        return Promise.resolve();
      }
       
      var creatorId = project.creatorId;
      if(loginUserId != creatorId){
        throw new CError(10);
      }
    }, function(e){
      throw e;
    }).catch(function(e){
      return Promise.reject(e);
    });
}


