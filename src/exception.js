'use strict';

var logger = require('./logger.js').logger('normal');

var CError = class CError{
	constructor(key, addParam){
		this.key = key;
		this.addParam = addParam;
	}
}

var ENUM = {
		0: function(){
			return {
				code: 0,
				res: {
					msg: `name has been registered`
				}	
			}
		},
		1: function(){
			return {
				code: 1,
				res: {
					msg: `email has been registered`
				}	
			}
		},
		2: function(param){
			return {
				code: 2,
				res: {
					msg: `db error`
				},
				log:{
					msg: `db error when insert user. err: ${JSON.stringify(param)}`,
					level: 'error'
				}
			}
		},
		3: function(param){
			return {
				code: 3,
				res: {
					msg: `unknown error`
				},
				log:{
					msg: `unkown error. message: ${JSON.stringify(param)}`,
					level: 'error'
				}
			}
		}
		
}

var action = function(res, err){
	//common error. not CError
	var tmpErr = err;
	if(err instanceof Error){
		tmpErr = new CError(3, err.message);
	}

	var e = ENUM[tmpErr.key](tmpErr.addParam);


	var code = e.code;
	
	if(e.res){
		res.end(JSON.stringify({
			errCode: code,
			errMsg: e.res.msg
		}))
	}
	

	if(e.log){
		var msg = e.log.msg;
		switch(e.log.level){
			case 'trace':
				logger.trace(msg);
				break;
			case 'info':
				logger.info(msg);
				break;
			case 'debug':
				logger.debug(msg);
				break;
			case 'warn':
				logger.warn(msg);
				break;
			case 'error':
				logger.error(msg);
				break;
			case 'fatal':
				logger.fatal(msg);
				break;

		}
	}
}

module.exports = {
	CError: CError,
	enum: ENUM,
	action: action,
}