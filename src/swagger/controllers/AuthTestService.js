'use strict';
var logger = require('../../logger.js').logger('normal');
//var UserModel = require('../models/user'); //this is cool! we need to redesign backend code.

var jwt = require('jwt-simple');
var jwtTokenSecret = require('../../constant.js').jwtTokenSecret;

exports.authTestGet = function(args, res, next) {
  try{
    var param = args['x-access-token']
    if(!param){
      var errstr = JSON.stringify({
          errCode: -1, 
          errMsg: `no token found. no user login`,
      });
      res.end(errstr);
      return;
    }


    var token = param.value;

    try {
      var decoded = jwt.decode(token, jwtTokenSecret); 
      if (decoded.exp <= Date.now()) {
        var errstr = JSON.stringify({
          errCode: 7, 
          errMsg: `token timeout`,
        });
        res.end(errstr);
        return;
      }

      /*User.findOne({ _id: decoded.iss }, function(err, user) {
        req.user = user;
      });*/
      //auth check model. 
      res.end(`success. decoded token:${JSON.stringify(decoded)}`);


    } catch (err) {
      var errstr = JSON.stringify({
        errCode: 6, //bad errorcode. string and simbol will be better.
        errMsg: `decode jwt token fail. ${err}`,
      });
      res.end(errstr);
      logger.error(`${errstr}`);
      return;
    }
  }catch(err){
    var errstr = JSON.stringify({
        errCode: 8, 
        errMsg: err,
    });
    res.end(errstr);
    logger.error(`${errstr}`);
    return;
  }
} 