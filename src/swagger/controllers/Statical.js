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
