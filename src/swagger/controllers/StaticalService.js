'use strict';
var moment = require('moment');
var EAction = require('../../exception.js').action;
var CError = require('../../exception.js').CError;
var logger = require('../../logger').logger('normal');
var StaticalPersistence = require('../../persistence/statical.js');


exports.getStaticalData = function(args, res, next) {
  //how to get user?
  var projectCreator = args.projectCreator.value;
  var taskType = args.taskType.value;
  var searchClause = args.searchClause.value;

  StaticalPersistence.getStaticalData().then(function(result){
    var err = result.err;
    var projects = result.projects;

    if(err){
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

exports.findStaticalProjectById = function(args, res, next) {
  //how to get user?
  var id = args.id.value;

  StaticalPersistence.findStaticalProjectById(id).then(function(result){
    var err = result.err;
    var project = result.project; //bad.

    if(err){
      throw new CError(3, '');
    } 

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      errCode: -1,
      entity: project
    }));
  }).catch(function(e){
    EAction(res, e);
  });
}

//todo.
exports.findStaticalTaskById = function(args, res, next) {
  var id = args.id.value;
  StaticalPersistence.findStaticalTaskById(id).then(function(result){
    var err = result.err;
    var task = result.task;

    if(err){
      throw new CError(3, '');
    } 

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      errCode: -1,
      entity: task
    }));
  }).catch(function(e){
    EAction(res, e);
  });
}
exports.findStaticalEngineById = function(args, res, next) {
  var id = args.id.value;
  StaticalPersistence.findStaticalEngineById(id).then(function(result){
    var err = result.err;
    var project = result.projects; //bad.

    if(err){
      throw new CError(3, '');
    } 

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      errCode: -1,
      entity: project
    }));
  }).catch(function(e){
    EAction(res, e);
  });
}





exports.staticalOptions = function(args, res, next) {
  res.end();
}
exports.findStaticalProjectByIdOptions = function(args, res, next) {
  res.end();
}
exports.findStaticalTaskByIdOptions = function(args, res, next) {
  res.end();
}
exports.findStaticalEngineByIdOptions = function(args, res, next) {
  res.end();
}