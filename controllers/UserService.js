'use strict';

var dbpool = require('../db.js');
var moment = require('moment');
var jwt = require('jwt-simple');
var logger = require('../index').logger('normal'); //not good to require app here.

exports.userGET = function(args, res, next) {
  /*var projecttemplates = [];
  var sql = 'select * from template_projects';
  dbpool.execute(sql, function(err, rows){
    if(err){
      console.log(err);
      res.end();
    }

    rows.map(function(row){
      projecttemplates.push({
        id: row.id,
        label: row.label,
      });
    })
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(projecttemplates || [], null, 2));
  });*/
}


exports.userPOST = function(args, res, next) {
  debugger;
  logger.info("hi log 4 js, i am post user.");
  var param = args.user.value;

  var name = param.name;
  var password = param.password;
  var email = param.email;

  var sql = `insert into user(name, password, email) 
    values ("${name}", "${password}", "${email}")`;


  dbpool.execute(sql, function(err, rows){
    if(err){


      if(err.errno === 1062){ //duplicate name/email
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
      id: userId,  
      token: token,
      expires: expires,
    }

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(user || {}, null, 2));
  });
}
