'use strict';
var url = require('url');
var Task = require('./TaskService');
var EAction = require('../../exception.js').action;

module.exports.addTask = function addTask (req, res, next) {
  	try{
		Task.addTask(req.swagger.params, res, next);
	}catch(e){
		EAction(res, e);
	}
};

module.exports.taskOptions = function taskOptions (req, res, next) {
	Task.taskOptions(req.swagger.params, res, next);
};







