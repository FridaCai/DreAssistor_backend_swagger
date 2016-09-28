'use strict';
var url = require('url');
var Curve = require('./CurveService');
var EAction = require('../../exception.js').action;

module.exports.findCurveById = function findCurveById (req, res, next) {
	try{
		Curve.findCurveById(req.swagger.params, res, next);		
	}catch(e){
		EAction(res, e);
	}
};
module.exports.curveOptions = function curveOptions (req, res, next) {
	Curve.curveOptions(req.swagger.params, res, next);
}