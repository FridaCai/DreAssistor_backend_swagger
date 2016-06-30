'use strict';
var logger = require('../../logger.js').logger('normal');
var jwt = require('jwt-simple');
var jwtTokenSecret = require('../../constant.js').jwtTokenSecret;
var User = require('../../model/user.js');

exports.authTestGet = function(args, res, next) {
  try{
    var token = args['x-access-token'].value;


    if(!token){
      var errstr = JSON.stringify({
          errCode: -1, 
          errMsg: `no token found. no user login`,
      });
      res.end(errstr);
      return;
    }



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

      User.findById(decoded.iss).then(function(result) {
        var err = result.err;
        var rows = result.rows;
        
        if(rows.length === 0) {
          var errstr = JSON.stringify({
            errCode: 9, //bad errorcode. string and simbol will be better.
            errMsg: `no user found`,
          });
          res.end(errstr); 
          return;
        }
        if(rows.length === 1){
          var errstr = JSON.stringify({
            errCode: -1,
            errMsg: `valid user`,
          });
          res.end(errstr); 
          return;
        }
      });
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