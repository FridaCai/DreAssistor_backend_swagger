'use strict';
var moment = require('moment');
var EAction = require('../../exception.js').action;
var CError = require('../../exception.js').CError;
var logger = require('../../logger').logger('normal');
var StaticalPersistence = require('../../persistence/statical.js');


exports.getStaticalData = function(args, res, next) {
  var startTime = Date.parse(new Date());

  //how to get user?
  var projectCreator = args.projectCreator.value;
  var taskType = args.taskType.value;
  var searchClause = args.searchClause.value;

  StaticalPersistence.getStaticalData(projectCreator, taskType, searchClause).then(function(result){
    var err = result.err;
    var projects = result.rows;

    if(err){
      logger.error(err.stack);
      throw new CError(3, '');
    } 

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      errCode: -1,
      projects: projects
    }));

    var diff = Date.parse(new Date()) - startTime;
    logger.trace('getStaticalData: ' + diff);

  }).catch(function(e){
    EAction(res, e);
  });
}

exports.findStaticalProjectById = function(args, res, next) {
  var startTime = Date.parse(new Date());

  //how to get user?
  var id = args.id.value;

  StaticalPersistence.findStaticalProjectById(id).then(function(result){
    var err = result.err;
    var project = result.project;
    
    //avoid to update tasks and engines;
    project.tasks = undefined;
    project.engines = undefined;

    if(err){
      logger.error(err.stack);
      throw new CError(3, '');
    } 

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      errCode: -1,
      entity: project
    }));

    var diff = Date.parse(new Date()) - startTime;
    logger.trace('findStaticalProjectById: ' + diff);

  }).catch(function(e){
    EAction(res, e);
  });
}


exports.findStaticalTasksByIds = function(args, res, next) {
  var startTime = Date.parse(new Date());

  var ids = args.ids.value.split(',');
  StaticalPersistence.findStaticalTasksByIds(ids).then(function(result){
    var err = result.err;
    var tasks = result.tasks;

    if(err){
      logger.error(err.stack);
      throw new CError(3, '');
    } 

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      errCode: -1,
      entity: tasks
    }));

    var diff = Date.parse(new Date()) - startTime;
    logger.trace('findStaticalTasksByIds: ' + diff);

  }).catch(function(e){
    EAction(res, e);
  });
}


exports.findStaticalTaskById = function(args, res, next) {
  var startTime = Date.parse(new Date());

  var id = args.id.value;
  StaticalPersistence.findStaticalTaskById(id).then(function(result){
    var err = result.err;
    var task = result.tasks[0];

    if(err){
      logger.error(err.stack);
      throw new CError(3, '');
    } 

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      errCode: -1,
      entity: task
    }));

    var diff = Date.parse(new Date()) - startTime;
    logger.trace('findStaticalTaskById: ' + diff);

  }).catch(function(e){
    EAction(res, e);
  });
}
exports.findStaticalEngineById = function(args, res, next) {
  var startTime = Date.parse(new Date());

  var id = args.id.value;
  StaticalPersistence.findStaticalEngineById(id).then(function(result){
    var err = result.err;
    var engine = result.engine;
    if(err){
      logger.error(err.stack);
      throw new CError(3, '');
    } 

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      errCode: -1,
      entity: engine
    }));

    var diff = Date.parse(new Date()) - startTime;
    logger.trace('findStaticalEngineById: ' + diff);
  

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
exports.findStaticalTasksByIdsOptions = function(args, res, next) {
  res.end();
}




