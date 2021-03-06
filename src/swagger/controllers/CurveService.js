var CurvePersistence = require('../../persistence/curve.js');
'use strict';
exports.curveOptions = function(args, res, next) {
  res.end();
}

exports.findCurveById = function(args, res, next){
	var startTime = Date.parse(new Date());

	var id = args.id.value;

	CurvePersistence.findById(id).then(function(result){
		var err = result.err;

		if(err){
		  logger.error(err.stack);
		  throw new CError(3, ''); //currently, there is only db error. not set msg to client.
		}

		res.setHeader('Content-Type', 'application/json;charset=UTF-8');
		res.end(JSON.stringify({
		  errCode: -1,
		  curve: result.curve
		}));
		
		var diff = Date.parse(new Date()) - startTime;
		logger.trace('findCurveById: ' + diff);

	}).catch(function(e){
		EAction(res, e);
	});
}
exports.findCurveByPropertyId = function(args, res, next){
	var startTime = Date.parse(new Date());

	var id = args.id.value;

	CurvePersistence.findByPropertyId(id).then(function(result){
		var err = result.err;

		if(err){
		  logger.error(err.stack);
		  throw new CError(3, ''); //currently, there is only db error. not set msg to client.
		}

		res.setHeader('Content-Type', 'application/json;charset=UTF-8');
		res.end(JSON.stringify({
		  errCode: -1,
		  curve: result.curve
		}));
		
		var diff = Date.parse(new Date()) - startTime;
		logger.trace('findCurveByPropertyId: ' + diff);

	}).catch(function(e){
		EAction(res, e);
	});
}
exports.findCurveByPropertyIdOptions = function(args, res, next){
	res.end();
}