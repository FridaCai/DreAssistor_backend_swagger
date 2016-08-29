'use strict';
module.exports = class Tag {
	constructor(){

	}

	init(param){
		this.id = param.id;
		this.label = param.label;
		this.time = param.time;
		this.week = param.week;		
	}
	dump(){
		return {
			id: this.id,
			label: this.label,
			time: this.time,
			week: this.week
		}
	}
	static create(param){
		var tag = new Tag();
		tag.init(param);
		return tag;
	}
}