'use strict';
var url = require('url');
var EAction = require('../../exception.js').action;
var DownloadFile = require('./DownloadFileService');

module.exports.downloadFile = function downloadFile (req, res, next) {
  	try{
		DownloadFile.downloadFile(req.swagger.params, res, next);
	}catch(e){
		EAction(res, e);
	}
};

module.exports.downloadFileOptions = function downloadFileOptions (req, res, next) {
	DownloadFile.downloadFileOptions(req.swagger.params, res, next);
};
