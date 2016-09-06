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


		//tricky. NULL -- no-need; 0 -- to be defined; 
		//never send 0 value to client, it does not make sense.
		//the same rule for attachment and image.
		this.curve = (param.curve === 0 ? {} : param.curve); 
		this.attachment = (param.attachment === 0 ? [] : param.attachment);
		this.image = (param.image === 0 ? [] : param.image);
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