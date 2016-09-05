'use strict';

module.exports = class Property{
	static create(param){
		var property = new Property();
		property.init(param);
		return property;
	}
	constructor(){
	}

	init(param){
		this.id = param.id;
		this.dropdown = param.dropdown;
		this.text = param.text;
		this.value = param.value;
		this.refKey = param.refKey;
		this.status = param.status;
		this.label = param.label;
		this.key = param.key;

		this.curve = param.curve;
		this.attachment = param.attachment;
		this.image = param.image;
	}
	dump(){
		var obj = {
			id: this.id,
			key: this.key,
		};


		[
			'dropdown', 'text', 'value', 
			'refKey', 'status', 'label', 
			'curve', 'attachment', 'image'
		].map((function(key){
			if(this[key] != null){
				obj[key] = this[key];	
			}
		}).bind(this))

		return obj;
	}
}