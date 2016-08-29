'use strict';
var Task = require('./task');
var util=require('util');


 
var Tasks = class Tasks extends Array{
	constructor(){
		super();
	}

	initByParam(param){
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

//util.inherits(Tasks, Array); 

module.exports = Tasks;