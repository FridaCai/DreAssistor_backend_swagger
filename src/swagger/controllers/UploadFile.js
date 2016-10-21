'use strict';
var url = require('url');
var EAction = require('../../exception.js').action;
var UploadFile = require('./UploadFileService');

module.exports.uploadFile = function uploadFile (req, res, next) {
  	try{
		UploadFile.uploadFile(req.swagger.params, res, next);
	}catch(e){
		EAction(res, e);
	}
};

module.exports.uploadFileOptions = function uploadFileOptions (req, res, next) {
	UploadFile.uploadFileOptions(req.swagger.params, res, next);
};
