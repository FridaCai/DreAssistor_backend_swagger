'use strict';
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
module.exports.findCurveByPropertyId = function findCurveByPropertyId (req, res, next) {
	try{
		Curve.findCurveByPropertyId(req.swagger.params, res, next);		
	}catch(e){
		EAction(res, e);
	}
};
module.exports.findCurveByPropertyIdOptions = function findCurveByPropertyIdOptions (req, res, next) {
	Curve.findCurveByPropertyIdOptions(req.swagger.params, res, next);
}
