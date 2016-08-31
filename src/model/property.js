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
		this.dropdownId = param.dropdownId;
		this.text = param.text;
		this.value = param.value;
		this.refKey = param.refKey;
		this.status = param.status;
		this.label = param.label;
	}
	dump(){
		return {
			dropdownId: this.dropdownId,
			text: this.text,
			value: this.value,
			refKey: this.refKey,
			status: this.status,
			label: this.label
		}
	}
}