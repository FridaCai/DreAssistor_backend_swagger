'use strict';

module.exports = class Attachment {
	constructor(){

	}

	init(param){
		this.id = param.id;
		this.label = param.label;
		this.guid = param.guid;
	}

	dump(){
		return {
			id: this.id,
			label: this.label,
			guid: this.guid
		}
	}

	static create(param){
		var at = new Attachment();
		at.init(param);
		return at;
	}
}