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
			dbpool.execute(sql, function(err, rows){
				resolve({
					err: err,
					rows: rows
				});
			});
		})
	}

	static findUserByEmail(email){
		var sql = `select * from user where email = "${email}" and status = 0`;
		return new Promise(function(resolve, reject){
			dbpool.execute(sql, resolve);	
		})
	}

	static findUserById(id){
		var sql = `select * from user where id = "${id}" and status = 0`;
		return new Promise(function(resolve, reject){
			dbpool.execute(sql, resolve);	
		}) 
	}
}
