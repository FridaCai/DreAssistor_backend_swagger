'use strict';
var moment = require('moment');
var EAction = require('../../exception.js').action;
var CError = require('../../exception.js').CError;
var logger = require('../../logger').logger('normal');
var ProjectPersistence = require('../../persistence/project.js');

exports.projectOptions = function(args, res, next) {
  res.end();
}
exports.projectOptions2 = function(args, res, next) {
  res.end();
}

exports.findProjects = function(args, res, next) {
  //how to get user?
  var userId = args.userId.value;
  var param = {
    userId: userId
  }

  ProjectPersistence.findProjects(param).then(function(result){
    var err = result.err;
    var projects = result.projects;

    if(err){
      logger.error(err.stack);
      throw new CError(3, '');
    } 

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      errCode: -1,
      projects: projects
    }));
  }).catch(function(e){
    EAction(res, e);
  });
}

exports.findProjectById = function(args, res, next) {
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
  }).catch(function(e){
    EAction(res, e);
  });
}

exports.insertProject = function(args, res, next) {
  var param = args.project.value;
  
  ProjectPersistence.insertProject(param).then(function(result){
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
  }).catch(function(e){
    EAction(res, e);
  });
}

exports.deleteProjectById = function(args, res, next) {
  var id = args.id.value;
  var restore = args.restore.value;
  ProjectPersistence.deleteProjectById(id, restore).then(function(result){
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
  }).catch(function(e){
    EAction(res, e);
  });
}
exports.updateProject = function(args, res, next) {
  var projectId = args.id.value;
  var project = args.project.value;

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
  }).catch(function(e){
    EAction(res, e);
  });
}
