'use strict';

var Attachment = require('./AttachmentService');
var EAction = require('../../exception.js').action;

module.exports.findAttachmentByTaskId = function findAttachmentByTaskId (req, res, next) {
	try{
		Attachment.findAttachmentByTaskId(req.swagger.params, res, next);
	}catch(e){
		EAction(res, e);
	}
};
module.exports.findAttachmentByTaskIdOptions = function findAttachmentByTaskIdOptions (req, res, next) {
	Attachment.findAttachmentByTaskIdOptions(req.swagger.params, res, next);
};

module.exports.findAttachmentByPropertyId = function findAttachmentByPropertyId (req, res, next) {
	try{
		Attachment.findAttachmentByPropertyId(req.swagger.params, res, next);
	}catch(e){
		EAction(res, e);
	}
};
module.exports.findAttachmentByPropertyIdOptions = function findAttachmentByPropertyIdOptions (req, res, next) {
	Attachment.findAttachmentByPropertyIdOptions(req.swagger.params, res, next);
};





