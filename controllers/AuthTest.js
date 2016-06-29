'use strict';

var url = require('url');

var AuthTest = require('./AuthTestService');

module.exports.authTestGet = function authTestGet (req, res, next) {
  AuthTest.authTestGet(req.swagger.params, res, next);
};
