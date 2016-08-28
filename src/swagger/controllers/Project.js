'use strict';
var url = require('url');
var Project = require('./ProjectService');
var EAction = require('../../exception.js').action;

module.exports.projectGET = function projectGET (req, res, next) {
	try{
		Project.projectGET(req.swagger.params, res, next);		
	}catch(e){
		EAction(res, e);
	}
};

module.exports.projectPOST = function projectPOST (req, res, next) {
  	try{
		Project.projectPOST(req.swagger.params, res, next);	
	}catch(e){
		EAction(res, e);
	}
};

module.exports.projectOptions = function projectOptions (req, res, next) {
	Project.projectOptions(req.swagger.params, res, next);
};





