'use strict';
var dbpool = require('../db.js');

module.exports = class Persistence{
	constructor(){
		
	}

	static insertUser(param){
		var name = param.name;
		var email = param.email;
		var password = param.password;
		var sql = `insert into user(name, password, email) 
    		values ("${name}", "${password}", "${email}")`;


		return new Promise(function(resolve, reject){
			dbpool.execute(sql, function(){
				resolve(arguments[0], arguments[1]);
			});	
		})
		
	}
}
