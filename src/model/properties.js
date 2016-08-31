'use strict';
var Property = require('./property');

module.exports = class Properties extends Array{
	static create(param){
		var properties = new Properties();
		properties.init(param);
		return properties;
	}
	constructor(){
		super();
	}

	init(param){
		param.map((function(propertyParam){
			var property = Property.create(propertyParam);
			this.push(property);
		}).bind(this))
	}
	dump(){
		return this.map(function(property){
			return property.dump();
		})
	}
}