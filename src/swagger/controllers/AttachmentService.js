'use strict';
var logger = require('../../logger.js').logger('normal');
var AttachmentPersistence = require('../../persistence/attachment.js');

var EAction = require('../../exception.js').action;
var CError = require('../../exception.js').CError;

exports.findAttachmentByTaskId = function(args, res, next) {
	var taskId = args.id.value;
	AttachmentPersistence.findByTaskId(taskId).then(function(result){
		var err = result.err;

		if(err){
		  logger.error(err.stack);
		  throw new CError(3, ''); //currently, there is only db error. not set msg to client.
		}

		res.setHeader('Content-Type', 'application/json;charset=UTF-8');
		res.end(JSON.stringify({
		  errCode: -1,
		  attachment: result.attachment
		}));
	}).catch(function(e){
		EAction(res, e);
	});
} 

exports.findAttachmentByPropertyId = function(args, res, next) {
	var propertyId = args.id.value;
	AttachmentPersistence.findByPropertyId(propertyId).then(function(result){
		var err = result.err;

		if(err){
		  logger.error(err.stack);
		  throw new CError(3, ''); //currently, there is only db error. not set msg to client.
		}

		res.setHeader('Content-Type', 'application/json;charset=UTF-8');
		res.end(JSON.stringify({
		  errCode: -1,
		  attachment: result.attachment
		}));
	}).catch(function(e){
		EAction(res, e);
	});
} 

exports.findAttachmentByTaskIdOptions = function(args, res, next) {
  res.end();
}

exports.findAttachmentByPropertyIdOptions = function(args, res, next) {
  res.end();
}
