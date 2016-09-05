'use strict';
var url = require('url');
var Task = require('./TaskService');
var EAction = require('../../exception.js').action;

module.exports.insert = function insert (req, res, next) {
  	try{
		Task.insert(req.swagger.params, res, next);
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


module.exports.findById = function findById(req, res, next) {
	Task.findById(req.swagger.params, res, next);	
}

module.exports.deleteById = function deleteById(req, res, next) {
	Task.deleteById(req.swagger.params, res, next);		
}



