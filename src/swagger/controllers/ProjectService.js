'use strict';
var moment = require('moment');
var Project = require('../../model/project.js');

var EAction = require('../../exception.js').action;
var CError = require('../../exception.js').CError;
var logger = require('../../logger').logger('normal');

exports.projectOptions = function(args, res, next) {
  res.end();
}

/*exports.projectGET = function(args, res, next) {
  var email = args.email.value;
  var password = args.password.value;
  var param = {
    email: email,
    password: password,
  };

  Project.findByEmail(email).then(function(result){
    var err = result.err;
    var rows = result.rows;

    if(err){
      throw new CError(2, JSON.stringify(err));
    } 

    if(rows.length === 0){
      throw new CError(4, JSON.stringify(param));
    }

    if(rows.length > 1){
      var e = new CError(5, JSON.stringify(param));
      EAction(res, e);
    }

    var project = new Project();
    project.init(rows[0]);

    if(!project.isPasswordValid(password)){
      throw new CError(6);
    } 

    var expires = moment().add( 8, 'hours').valueOf();
    var token = jwt.encode({
      iss: project.id,
      exp: expires
    }, jwtTokenSecret);

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      errCode: -1,
      project: project,
      token: token,
      expires: expires,
    }));
  }).catch(function(e){
    EAction(res, e);
  });
}*/

exports.projectPOST = function(args, res, next) {
  var param = args.project.value;
  
  Project.save(param).then(function(result){
    var err = result.err;
    
    if(err){
      logger.error(err.message);
      throw new CError(3, ''); //currently, there is only db error. not set msg to client.
    }

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      errCode: -1,
      //projectId: projectId,  //return project json.
    }));
  }).catch(function(e){
    EAction(res, e);
  });
}
