'use strict';
var Attachment = require('./attachment');
var util=require('util');
 
var Attachments = class Attachments extends Array{
	static create(param){
		var attachments = new Attachments();
		attachments.init(param);
		return attachments;
	}
	constructor(){
		super();
	}

	init(params){
		params.map((function(param){
			var at = Attachment.create(param);
			this.push(at);
		}).bind(this))
	}

	dump(){
		return this.map(function(param){
			return param.dump();
		})
	}
}

module.exports = Attachments;