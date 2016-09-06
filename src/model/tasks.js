'use strict';
var Task = require('./task');
var util=require('util');


 
var Tasks = class Tasks extends Array{
	static create(param){
		var tasks = new Tasks();
		tasks.init(param);
		return tasks;
	}
	constructor(){
		super();
	}

	init(param){
		param.map((function(taskParam){
			var task = Task.create(taskParam);
			this.push(task);
		}).bind(this))
	}

	dump(){
		return this.map(function(task){
			return task.dump();
		})
	}
}

module.exports = Tasks;