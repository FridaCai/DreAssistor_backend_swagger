'use strict';

var url = require('url');

var AuthTest = require('./AuthTestService');
var EAction = require('../../exception.js').action;

module.exports.authTestGet = function authTestGet (req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	
	try{
		AuthTest.authTestGet(req.swagger.params, res, next);
	}catch(e){
		EAction(res, e);
	}
};
