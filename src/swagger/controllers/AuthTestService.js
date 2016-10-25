'use strict';
var logger = require('../../logger.js').logger('normal');
var jwt = require('jwt-simple');
var jwtTokenSecret = require('../../constant.js').jwtTokenSecret;
var UserPersistence = require('../../persistence/user.js');

var EAction = require('../../exception.js').action;
var CError = require('../../exception.js').CError;

exports.authTestGet = function(args, res, next) {
  var startTime = Date.parse(new Date());

  var token = args['x-access-token'].value;

  if(!token){
    throw new CError(7);
  }

  var decoded = jwt.decode(token, jwtTokenSecret); 
  if(decoded.exp <= Date.now()){
    throw new CError(8)
  }

  UserPersistence.findUserById(decoded.iss).then(function(result) {
    var err = result.err;
    var rows = result.rows;
    
    if(!rows.length){
      throw new CError(9); 
    }

    if(rows.length === 1){
      var user = rows[0]; //another choise is to new a user instance and init it with param. but too complex and no need.
      var errstr = JSON.stringify({
        errCode: -1,
        user: user
      });
      res.setHeader('Content-Type', 'application/json');
      res.end(errstr); 

      var diff = Date.parse(new Date()) - startTime;
      logger.trace('authTestGet: ' + diff);
    }
  });
} 

exports.authTestOptions = function(args, res, next) {
  res.end();
}
