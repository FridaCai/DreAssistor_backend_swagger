'use strict';
var url = require('url');
var User = require('./UserService');
var EAction = require('../../exception.js').action;

module.exports.userGET = function userGET (req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

	try{
		User.userGET(req.swagger.params, res, next);		
	}catch(e){
		EAction(res, e);
	}
};

module.exports.userPOST = function userPOST (req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  	try{
		User.userPOST(req.swagger.params, res, next);	
	}catch(e){
		EAction(res, e);
	}
};







