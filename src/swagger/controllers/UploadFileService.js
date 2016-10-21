'use strict';
var moment = require('moment');
var EAction = require('../../exception.js').action;
var CError = require('../../exception.js').CError;
var logger = require('../../logger').logger('normal');
var fs = require('fs-extra'); 


exports.uploadFile = function(args, res, next) {
  var file = args.file.value;
  var filename = file.originalname;

  console.log(`file.encoding: ${file.encoding}`);
  console.log(`file.fieldname: ${file.fieldname}`);
  console.log(`file.mimetype: ${file.mimetype}`);
  console.log(`file.originalname: ${file.originalname}`);
  console.log(`file.size: ${file.size}`);

  fs.ensureDir('./uploadfiles', function(err){
      if(err){
        throw(err);
      }
      fs.writeFile('./uploadfiles/' + filename, file.buffer, function(err){
        throw(err);
      })
  })
}

exports.uploadFileOptions = function(args, res, next) {
  res.end();
}