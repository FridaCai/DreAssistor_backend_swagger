'use strict';
var logger = require('../../logger.js').logger('normal');
var jwt = require('jwt-simple');
var jwtTokenSecret = require('../../constant.js').jwtTokenSecret;
var UserPersistence = require('../../persistence/user.js');

var EAction = require('../../exception.js').action;
var CError = require('../../exception.js').CError;

exports.authTestGet = function(args, res, next) {
  var startTime = Date.parse(new Date());

  this.getUserByToken(args).then(function(user){
      var errstr = JSON.stringify({
        errCode: -1,
        user: user
      });
      res.setHeader('Content-Type', 'application/json');
      res.end(errstr); 

      var diff = Date.parse(new Date()) - startTime;
      logger.trace('authTestGet: ' + diff);
  }, function(e){
    throw e;
  }).catch(function(e){
    throw e;
  })
}

exports.authTestOptions = function(args, res, next) {
  res.end();
}

exports.getUserByToken = function(args){
  var token = args['x-access-token'].value;

  if(!token){
    throw new CError(7);
  }

  var decoded = jwt.decode(token, jwtTokenSecret); 
  if(decoded.exp <= Date.now()){
    throw new CError(8)
  }

  return UserPersistence.findUserById(decoded.iss).then(function(result){
    var err = result.err;
    var rows = result.rows;
    
    if(err){
      logger.error(err.stack);
      return Promise.reject(new CError(3));
    }

    if(!rows.length){
      return Promise.reject(new CError(9)); 
    }

    if(rows.length === 1){
      var user = rows[0];
      return Promise.resolve(user); 
    }
  });
}





