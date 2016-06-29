'use strict';
var url = require('url');
var User = require('./UserService');


module.exports.userGET = function userGET (req, res, next) {
  User.userGET(req.swagger.params, res, next);
};

module.exports.userPOST = function userPOST (req, res, next) {
  User.userPOST(req.swagger.params, res, next);
};







