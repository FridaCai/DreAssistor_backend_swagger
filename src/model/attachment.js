'use strict';

module.exports = class Attachment {
	constructor(){

	}

	init(param){
		this.id = param.id;
		this.label = param.label;
		this.url = param.url;
	}

	dump(){
		return {
			id: this.id,
			label: this.label,
			url: this.url
		}
	}

	static create(param){
		var at = new Attachment();
		at.init(param);
		return at;
	}
}