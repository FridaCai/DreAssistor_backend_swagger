'use strict';
var moment = require('moment');
var Project = require('../../model/project.js');

var EAction = require('../../exception.js').action;
var CError = require('../../exception.js').CError;
var logger = require('../../logger').logger('normal');

var Persistence = require('../../persistence/index.js');

exports.projectOptions = function(args, res, next) {
  res.end();
}

exports.findProjects = function(args, res, next) {
  //how to get user?
  var userId = args.userId.value;
  var param = {
    userId: userId
  }

  Persistence.findProjects(param).then(function(result){

    var err = result.err;
    var projects = result.projects;

    if(err){
      throw new CError(3, '');
    } 

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      errCode: -1,
      project: projects.map(function(project){
        return project.dump();
      })
    }));
  }).catch(function(e){
    EAction(res, e);
  });
}

exports.findProjectById = function(args, res, next) {

}

exports.addProject = function(args, res, next) {
  var param = args.project.value;
  
  Project.save(param).then(function(result){
    var err = result.err;
    
    if(err){
      logger.error(err.message);
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
