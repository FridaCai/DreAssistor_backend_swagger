'use strict';
var url = require('url');
var User = require('./UserService');


module.exports.userGET = function userGET (req, res, next) {debugger;
  User.userGET(req.swagger.params, res, next);
};

module.exports.userPOST = function userPOST (req, res, next) {debugger;
  User.userPOST(req.swagger.params, res, next);
};







