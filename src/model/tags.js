'use strict';
var Tag = require('./tag');

module.exports = class Tags extends Array{
	constructor(){
		super();
	}

	init(param){
		param.map((function(tagParam){
			var tag = Tag.create(tagParam);
			this.push(tag);
		}).bind(this))
	}
	dump(){
		return this.map(function(tag){
			return tag.dump();
		})
	}
}