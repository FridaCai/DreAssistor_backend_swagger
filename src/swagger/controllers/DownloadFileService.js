'use strict';
var moment = require('moment');
var EAction = require('../../exception.js').action;
var CError = require('../../exception.js').CError;
var logger = require('../../logger').logger('normal');
var fs = require('fs-extra'); 
var mime = require('mime');


exports.downloadFile = function(args, res, next) {
	var startTime = Date.parse(new Date());

	var guid = args.guid.value;
	var label = args.label.value;

	var mimetype = mime.lookup(label); //if not file extend, can mime work?
	res.setHeader('Content-disposition', `attachment; filename=${label}`);
	res.setHeader('Content-type', mimetype);

	var filestream = fs.createReadStream(`./uploadfiles/${guid}`);
    filestream.on('open', function () {
	    filestream.pipe(res);
	    
	    var diff = Date.parse(new Date()) - startTime;
		logger.trace('downloadFile: ' + diff);
	});
	filestream.on('error', function(err) {
		logger.error(err.stack);
		res.end();
	});
}

exports.downloadFileOptions = function(args, res, next) {
  res.end();
}
