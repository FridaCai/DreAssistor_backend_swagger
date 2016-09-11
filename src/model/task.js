'use strict';
var PropertyWrap = require('./property_wrap.js'); 
var Attachments = require('./attachments.js');
var Subtasks = require('./subtasks.js');

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

		//no param.template for simple task query, eg: query project.
		if(param.template){
			this.template = {
				type: param.template.type,
				sheetNames: param.template.sheetNames,
				sheets: PropertyWrap.create(param.template.sheets)	
			};	
		}
		if(param.attachment){
			this.attachment = Attachments.create(param.attachment);
		}
		if(param.subtask){
			this.subtask = Subtasks.create(param.subtask);
		}
	}

	dump(){
		var obj = {
			id: this.id,
			label: this.label,
			startTime: this.startTime,
			endTime: this.endTime,
			startWeek: this.startWeek,
			endWeek: this.endWeek,
			desc: this.desc,
			exp: this.exp,
			priority: this.priority,
			attachment: this.attachment ? this.attachment.dump(): [],
			subtask: this.subtask ? this.subtask.dump(): []
		}
		if(this.template){
			obj.template = {
				type: this.template.type,
				sheetNames: this.template.sheetNames,
				sheets: this.template.sheets.dump()
			}
		}
		return obj;
	}
	static create(param){
		var task = new Task();
		task.init(param);
		return task;
	}
}