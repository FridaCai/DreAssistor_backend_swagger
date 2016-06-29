'use strict';

var dbpool = require('../db.js');
var moment = require('moment');
var jwt = require('jwt-simple');
var logger = require('../index').logger('normal'); //not good to require app here.

exports.userGET = function(args, res, next) {
  var email = args.email.value;
  var password = args.password.value;
  var param = {
    email: email,
    password: password,
  };

  //User.findOne({username : unsername}); 
  //sql clause should be all together. eg: each clause should add status == 0 condition
  //sql execute should be capsulate.
  var sql = `select * from user where email = "${email}" and status = 0`;
  dbpool.execute(sql, function(err, rows){
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
        errCode: 4, //find duplicate user email which should not happen. 
        errMsg: `duplicate user email found. param: ${JSON.stringify(param)}`,
      });
      logger.error(`${errstr}`);
    }

    var row = rows[0];
    var userId = row.id;
    var userPassword = row.password;

    if(userPassword != password){//better coding style: user.validPassword(pw)
        var errstr = JSON.stringify({
          errCode: 5, //user input wrong password.
          errMsg: `wrong password input. param: ${JSON.stringify(param)}`,
        });
      logger.info(`${errstr}`);
    } 



    var expires = moment().add( 8, 'hours').valueOf();
    var token = jwt.encode({
      iss: userId,
      exp: expires
    }, 'jwtTokenSecret'); //jwtTokenSecret should be in a better place.



    var user = {
      id: userId,
      token: token,
      expires: expires,
    }

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(user || {}, null, 2));

  })
}


exports.userPOST = function(args, res, next) {
  var param = args.user.value;
  var name = param.name;
  var email = param.email;
  var password = param.password;

  var sql = `insert into user(name, password, email) 
    values ("${name}", "${password}", "${email}")`;

  dbpool.execute(sql, function(err, rows){
    if(err){
      if(err.errno === 1062){
        var msg = err.message;
        var errMsg;
        var errCode;
        if(msg.indexOf('name')!=-1){
          errCode = 0;
          errMsg = `name already exist in user database`;
        }else if(msg.indexOf('email')!=-1){
          errCode = 1;
          errMsg = `email already exist in user database`;
        }
      } 
      res.end(JSON.stringify({
        errCode: errCode, 
        errMsg: errMsg,
      }));
      return;
    }

    var userId = rows.insertId;
    var expires = moment().add( 8, 'hours').valueOf();
    var token = jwt.encode({
      iss: userId,
      exp: expires
    }, 'jwtTokenSecret'); //jwtTokenSecret should be in a better place.



    var user = {
      id: userId,  //return user.toJSON()
      token: token,
      expires: expires,
    }

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(user || {}, null, 2));
  });
}
