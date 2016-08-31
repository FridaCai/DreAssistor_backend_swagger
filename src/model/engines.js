'use strict';
var Engine = require('./engine.js');

module.exports = class Engines extends Array{
	constructor(){
		super();
	}

	init(param){
		param.map((function(engineParam){
			var engine = Engine.create(engineParam);
			this.push(engine);
		}).bind(this))
	}
	dump(){
		return this.map(function(engine){
			return engine.dump();
		})
	}
}