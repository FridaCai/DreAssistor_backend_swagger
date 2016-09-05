'use strict';
var dbpool = require('../db.js');
var PropertyPersistence = require('./property.js');

var EnginePersistence = class EnginePersistence {
	constructor(){
		
	}
	static delete(conn, condition){
		var id = (condition.key === 'id') ? condition.value:'NULL';
		var projectId = (condition.key === 'project_id') ? condition.value:'NULL';

		var selectEngine = function(){} 


		//todo.
		var deleteEngines = function(result, conn){
			var sql = `update engine
				set engine.flag=1
				where engine.id=${id} 
				or engine.project_id=${projectId}`;

	        return new Promise(function(resolve, reject){
	            conn.query(sql, function(err, result) {
	                if (err) {
	                    reject(sql + '\n' + new Error(err.stack));
	                }
	                resolve(result);
	            })    
	        })
		}

		//todo
		var deleteProperties = function(result, conn){
			debugger;
			//can we get deleted engine id here?
			return PropertyPersistence.deleteByEngineIds()
		}

		var transactionArr = [[deleteEngines], [deleteProperties]]

		
	}

	static deleteByProjectId(conn, id){
		var condition = {
			key: 'project_id',
			value: id
		}
		return EnginePersistence.delete(conn, condition);
	}
	static deleteById(conn, id){
		var condition = {
			key: 'id',
			value: id
		}
		return EnginePersistence.delete(conn, condition);
	}
}

module.exports = EnginePersistence;

