'use strict';

var url = require('url');

var AuthTest = require('./AuthTestService');
var EAction = require('../../exception.js').action;

module.exports.authTestGet = function authTestGet (req, res, next) {
	try{
		AuthTest.authTestGet(req.swagger.params, res, next);
	}catch(e){
		EAction(res, e);
	}
};
module.exports.authTestOptions = function authTestOptions (req, res, next) {
	AuthTest.authTestOptions(req.swagger.params, res, next);
};




