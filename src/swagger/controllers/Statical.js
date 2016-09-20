'use strict';
var url = require('url');
var Statical = require('./StaticalService');
var EAction = require('../../exception.js').action;

module.exports.getStaticalData = function getStaticalData (req, res, next) {
	try{
		Statical.getStaticalData(req.swagger.params, res, next);		
	}catch(e){
		EAction(res, e);
	}
};
module.exports.findStaticalProjectById = function findStaticalProjectById (req, res, next) {
	try{
		Statical.findStaticalProjectById(req.swagger.params, res, next);		
	}catch(e){
		EAction(res, e);
	}
};

module.exports.findStaticalTaskById = function findStaticalTaskById (req, res, next) {
	try{
		Statical.findStaticalTaskById(req.swagger.params, res, next);		
	}catch(e){
		EAction(res, e);
	}
};
module.exports.findStaticalEngineById = function findStaticalEngineById (req, res, next) {
	try{
		Statical.findStaticalEngineById(req.swagger.params, res, next);		
	}catch(e){
		EAction(res, e);
	}
};






module.exports.staticalOptions = function staticalOptions (req, res, next) {
	Statical.staticalOptions(req.swagger.params, res, next);
};
module.exports.findStaticalProjectByIdOptions = function findStaticalProjectByIdOptions (req, res, next) {
	Statical.findStaticalProjectByIdOptions(req.swagger.params, res, next);
};
module.exports.findStaticalTaskByIdOptions = function findStaticalTaskByIdOptions (req, res, next) {
	Statical.findStaticalTaskByIdOptions(req.swagger.params, res, next);
};
module.exports.findStaticalEngineByIdOptions = function findStaticalEngineByIdOptions (req, res, next) {
	Statical.findStaticalEngineByIdOptions(req.swagger.params, res, next);
};
