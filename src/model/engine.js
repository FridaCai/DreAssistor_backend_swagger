'use strict';
var Properties = require('./properties.js');

module.exports = class Engine{
	static create(param){
		var engine = new Engine();
		engine.init(param);
		return engine;
	}
	constructor(){

	}
	init(param){
		this.id = param.id;
		this.properties = Properties.create(param.properties);
	}
	dump(){
		return {
			id: this.id,
			properties: this.properties.dump()
		}
	}

}