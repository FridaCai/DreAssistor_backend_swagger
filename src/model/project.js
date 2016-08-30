'use strict';
var Persistence = require('../persistence/index.js'); //todo: problem here. call persistence in swagger controller directly.
var Tasks = require('./tasks');
var Tags = require('./tags');

module.exports = class Project {
	constructor(){

	}

	init(param){
		this.id = param.id;
		this.creatorId = param.creatorId;
		this.label = param.label;
		this.sorp = param.sorp;

		this.tasks = new Tasks();
		this.tags = new Tags();
		this.engines = [];
		this.properties = [];
	}
	
	setTasksByParam(param){
		this.tasks.initByParam(param);
	}

	setTagsByParam(param){
		this.tags.initByParam(param);	
	}
	
	dump(){
		return {
			id: this.id,
			creatorId: this.creatorId,
			label: this.label,
			sorp: this.sorp,


			tasks: this.tasks.dump(),
			tags: this.tags.dump(),
			engines: this.engines,
			properties: this.properties
		}
	}

	static create(param){
		var project = new Project();
		project.init(param);
		return project;
	}
	static save(param) {
  		return Persistence.insertProject(param).then(function(result){
  			return result;
  		});
	}
}