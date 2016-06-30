'use strict';
var Persistence = require('../persistence/index.js');
module.exports = class User {
	constructor(){
		
	}

	static save(param) {
  		return Persistence.insertUser(param).then(function(result){
  			return result;
  		});
	}

	static findByEmail(email){
  		return Persistence.findUserByEmail(email).then(function(result){
  			return result;
  		});
	}
	static findById(id){
		return Persistence.findUserById(id).then(function(result){
			return result;
		});
	}

	init(param){
		this.id = param.id;
		this.name = param.name;
		this.email = param.email;
		this.password = param.password;
	}

	isPasswordValid(pw){
		return this.password == pw;
	}
	
	dump(){
		return {
			id: this.id,
			name: this.label,
			email: this.url,
		}
	}
}