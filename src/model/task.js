'use strict';
module.exports = class Task {
	constructor(){

	}

	init(param){
		this.id = param.id;
		this.label = param.label;
		this.startTime = param.startTime;
		this.endTime = param.endTime;
		this.startWeek = param.startWeek;
		this.endWeek = param.endWeek;
		this.desc = param.desc;
		this.exp = param.exp;
		this.priority = param.priority;
		this.templateType = param.templateType;

	}

	dump(){
		return {
			id: this.id,
			label: this.label,
			startTime: this.startTime,
			endTime: this.endTime,
			startWeek: this.startWeek,
			endWeek: this.endWeek,
			desc: this.desc,
			exp: this.exp,
			priority: this.priority,
			templateType: this.templateType
		}
	}
	static create(param){
		var task = new Task();
		task.init(param);
		return task;
	}
}