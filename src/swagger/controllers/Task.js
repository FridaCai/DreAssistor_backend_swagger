'use strict';
var url = require('url');
var Task = require('./TaskService');
var EAction = require('../../exception.js').action;

module.exports.insertTask = function insertTask (req, res, next) {
  	try{
		Task.insertTask(req.swagger.params, res, next);
	}catch(e){
		EAction(res, e);
	}
};

module.exports.taskOptions = function taskOptions (req, res, next) {
	Task.taskOptions(req.swagger.params, res, next);
};
module.exports.taskOptions2 = function taskOptions (req, res, next) {
	Task.taskOptions2(req.swagger.params, res, next);
};


module.exports.findTaskById = function findTaskById(req, res, next) {
	Task.findTaskById(req.swagger.params, res, next);	
}

module.exports.deleteTaskById = function deleteTaskById(req, res, next) {
	Task.deleteTaskById(req.swagger.params, res, next);		
}

module.exports.updateTask = function updateTask(req, res, next) {
	Task.updateTask(req.swagger.params, res, next);		
}

