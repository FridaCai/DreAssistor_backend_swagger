'use strict';
var Persistence = require('../persistence/index.js');

module.exports = class Project {
	constructor(){
		
	}

	static save(param) {
  		return Persistence.insertProject(param).then(function(result){
  			return result;
  		});
	}
}