'use strict';
var moment = require('moment');
var jwt = require('jwt-simple');
var jwtTokenSecret = require('../../constant.js').jwtTokenSecret;
var User = require('../../model/user.js');

var EAction = require('../../exception.js').action;
var CError = require('../../exception.js').CError;

exports.userGET = function(args, res, next) {
  var email = args.email.value;
  var password = args.password.value;
  var param = {
    email: email,
    password: password,
  };

  User.findByEmail(email).then(function(result){
    var err = result.err;
    var rows = result.rows;
    if(err){
      var errstr = JSON.stringify({
        errCode: 2, //unknown db error 
        errMsg: err.message,
      });
      res.end(errstr);
      logger.error(`${errstr}`);
      return;
    }

    if(rows.length === 0){
      var errstr = JSON.stringify({
        errCode: 3, //user not found
        errMsg: `user not found. param: ${JSON.stringify(param)}`,
      });
      res.end(errstr);
      logger.info(`${errstr}`); 
      return; 
    }

    if(rows.length > 1){
      var errstr = JSON.stringify({
        errCode: 4, //find duplicate user email which should not happen. sth wrong with db constrain
        errMsg: `duplicate user email found. param: ${JSON.stringify(param)}`,
      });
      logger.error(`${errstr}`);
    }


    var user = new User();
    user.init(rows[0]);

    if(!user.isPasswordValid(password)){//better coding style: user.validPassword(pw)
      var errstr = JSON.stringify({
          errCode: 5, //user input wrong password.
          errMsg: `wrong password input. param: ${JSON.stringify(param)}`,
        });
      logger.info(`${errstr}`);
      return;
    } 



    var expires = moment().add( 8, 'hours').valueOf();
    var token = jwt.encode({
      iss: user.id,
      exp: expires
    }, jwtTokenSecret);



    var user = {
      user: user.dump(),
      token: token,
      expires: expires,
    }

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(user || {}, null, 2));
  });
}




exports.userPOST = function(args, res, next) {
  var param = args.user.value;
  var name = param.name;
  var email = param.email;
  var password = param.password;


  User.save(param).then(function(result){
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



    var user = {
      id: userId,  //return user.toJSON()
      token: token,
      expires: expires,
    }

    res.setHeader('Content-Type', 'application/json');
    res.end({
      errCode: -1,
      user: JSON.stringify(user || {}, null, 2),
    });
  }).catch(function(e){
    EAction(res, e);
  });
}
