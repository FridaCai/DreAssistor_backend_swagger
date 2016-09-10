'use strict';
var Subtask = require('./subtask');
var util=require('util');
 
var Subtasks = class Subtasks extends Array{
	static create(param){
		var subtask = new Subtasks();
		subtask.init(param);
		return subtask;
	}
	constructor(){
		super();
	}

	init(params){
		params.map((function(param){
			var subtask = Subtask.create(param);
			this.push(subtask);
		}).bind(this))
	}

	dump(){
		return this.map(function(param){
			return param.dump();
		})
	}
}
module.exports = Subtasks;