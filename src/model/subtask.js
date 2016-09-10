'use strict';

module.exports = class Subtask {
	constructor(){

	}

	init(param){
		this.id = param.id;
		this.label = param.label;
		this.status = param.status;
	}

	dump(){
		return {
			id: this.id,
			label: this.label,
			status: this.status
		}
	}

	static create(param){
		var st = new Subtask();
		st.init(param);
		return st;
	}
}