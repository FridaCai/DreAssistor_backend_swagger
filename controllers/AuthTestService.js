'use strict';
var logger = require('../index').logger('normal');
//var UserModel = require('../models/user'); //this is cool! we need to redesign backend code.

var jwt = require('jwt-simple');

exports.authTestGet = function(args, res, next) {
  debugger; //what is next???
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
      var decoded = jwt.decode(token, 'jwtTokenSecret'); //bad. app.get('jwtTokenSecret');
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


/*var resStr = {
      errorCode: -1,
      errorMessage: 'hello',
    }
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(resStr || [], null, 2));*/