'use strict';
var Persistence = require('../persistence/index.js');
module.exports = class User {
	constructor(){
		
	}

	static save(param) {
  		return Persistence.insertUser(param);
	}

	init(param){
		this.id = param.id;
		this.name = param.name;
		this.email = param.email;
		this.password = param.password;
	}
	
	update(param){
		//might have problem for array copy. 
		//$.extend(true, [], templateList);
		Object.assign(this, param); 
	}

	save(){

	}

	find(){

	}
	
	dump(){
		return {
			id: this.id,
			name: this.label,
			email: this.url,
		}
	}
}