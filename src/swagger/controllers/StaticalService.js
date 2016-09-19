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
