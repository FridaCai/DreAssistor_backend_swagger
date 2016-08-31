'use strict';
var Persistence = require('../persistence/index.js'); //todo: problem here. call persistence in swagger controller directly.
var Tasks = require('./tasks');
var Tags = require('./tags');
var Engines = require('./engines');
var Properties = require('./properties');

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
		this.engines = new Engines();
		this.properties = new Properties();
	}
	
	setTasksByParam(param){
		this.tasks.init(param);
	}
	setTagsByParam(param){
		this.tags.init(param);	
	}
	setEnginesByParam(param){
		this.engines.init(param);
	}
	setPropertiesByParam(param){
		this.properties.init(param);	
	}
	dump(){
		return {
			id: this.id,
			creatorId: this.creatorId,
			label: this.label,
			sorp: this.sorp,
			tasks: this.tasks.dump(),
			tags: this.tags.dump(),
			engines: this.engines.dump(),
			properties: this.properties.dump()
		}
	}

	static create(param){
		var project = new Project();
		project.init(param);
		return project;
	}
	
}