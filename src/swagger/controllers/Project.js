'use strict';
var url = require('url');
var Project = require('./ProjectService');
var EAction = require('../../exception.js').action;

module.exports.findProjects = function findProjects (req, res, next) {
	try{
		Project.findProjects(req.swagger.params, res, next);		
	}catch(e){
		EAction(res, e);
	}
};

module.exports.findProjectById = function findProjectById (req, res, next) {
	try{
		Project.findProjectById(req.swagger.params, res, next);		
	}catch(e){
		EAction(res, e);
	}
};

module.exports.insertProject = function insertProject (req, res, next) {
  	try{
		Project.insertProject(req.swagger.params, res, next);	
	}catch(e){
		EAction(res, e);
	}
};

module.exports.projectOptions = function projectOptions (req, res, next) {
	Project.projectOptions(req.swagger.params, res, next);
};
module.exports.projectOptions2 = function projectOptions (req, res, next) {
	Project.projectOptions2(req.swagger.params, res, next);
};

module.exports.deleteProjectById = function deleteProjectById(req, res, next){
	Project.deleteProjectById(req.swagger.params, res, next);
};

module.exports.updateProject = function updateProject(req, res, next){
	Project.updateProject(req.swagger.params, res, next);
};






