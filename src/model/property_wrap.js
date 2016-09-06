'use strict';
var Properties = require('./properties.js'); 

module.exports = class PropertyWrap extends Array{
	constructor(){
		super();
	}

	init(param){
		param.map((function(properties){
			this.push(Properties.create(properties));
		}).bind(this));
	}

	dump(){
		return this.map(function(properties){
			return properties.dump();
		})
	}
	static create(param){
		var propertyWrap = new PropertyWrap();
		propertyWrap.init(param);
		return propertyWrap;
	}
}