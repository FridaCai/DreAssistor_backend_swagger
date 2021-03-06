'use strict';
var moment = require('moment');
var jwt = require('jwt-simple');
var jwtTokenSecret = require('../../constant.js').jwtTokenSecret;
var UserPersistence = require('../../persistence/user.js');
var User = require('../../model/user.js');

var EAction = require('../../exception.js').action;
var CError = require('../../exception.js').CError;
var logger = require('../../logger.js').logger('normal');


exports.userOptions = function(args, res, next) {
  res.end();
}

exports.userGET = function(args, res, next) {
  var startTime = Date.parse(new Date());

  var email = args.email.value;
  var password = args.password.value;
  var param = {
    email: email,
    password: password,
  };

  UserPersistence.findUserByEmail(email).then(function(result){
    var err = result.err;
    var rows = result.rows;

    if(err){
      logger.error(err.stack);
      throw new CError(2, JSON.stringify(err));
    } 

    if(rows.length === 0){
      throw new CError(4, JSON.stringify(param));
    }

    if(rows.length > 1){
      var e = new CError(5, JSON.stringify(param));
      EAction(res, e);
    }

    var user = new User();
    user.init(rows[0]);

    if(!user.isPasswordValid(password)){
      throw new CError(6);
    } 

    var expires = moment().add( 8, 'hours').valueOf();
    var token = jwt.encode({
      iss: user.id,
      exp: expires
    }, jwtTokenSecret);

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      errCode: -1,
      user: user,
      token: token,
      expires: expires,
    }));

    var diff = Date.parse(new Date()) - startTime;
    logger.trace('userGET: ' + diff);


  }).catch(function(e){
    EAction(res, e);
  });
}




exports.userPOST = function(args, res, next) {
  var startTime = Date.parse(new Date());

  var param = args.user.value;
  var name = param.name;
  var email = param.email;
  var password = param.password;


  UserPersistence.insertUser(param).then(function(result){
    var err = result.err;
    var rows = result.rows;
    if(err){
      if(err.errno === 1062){
        var msg = err.message;
        if(msg.indexOf('name')!=-1){
          throw new CError(0);
        }else if(msg.indexOf('email')!=-1){
          throw new CError(1);
        }
      } 
      throw new CError(2, JSON.stringify(err));
    }

    var userId = rows.insertId;
    var expires = moment().add( 8, 'hours').valueOf();
    var token = jwt.encode({
      iss: userId,
      exp: expires
    }, jwtTokenSecret); 

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      errCode: -1,
      userId: userId,  
      token: token,
      expires: expires,
    }));

    var diff = Date.parse(new Date()) - startTime;
    logger.trace('userPOST: ' + diff);

  }).catch(function(e){
    EAction(res, e);
  });
}
