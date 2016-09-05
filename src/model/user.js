'use strict';
module.exports = class User {
	constructor(){
		
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