'use strict';
var dbpool = require('../db.js');

var SubTaskPersistence = class SubTaskPersistence {
	constructor(){
		
	}
	
	static assembleUpdateHandlers(task){
		var deleteByTaskId = function(result, conn){
			var taskId = task.id;
			var sql = `delete from subtask where task_id=${taskId}`;
			return new Promise(function(resolve, reject){
	            conn.query(sql, function(err, result) {
	                if (err) {
	                    var errmsg = sql + '\n' + err.stack;
	                    reject(new Error(errmsg));
	                    return;
	                }
	                resolve(result);
	            })    
	        })
		}

		var insert = function(result, conn){
			if(task.subtask.length ===0)
				return Promise.resolve();

			var sqls = [];
			task.subtask.map(function(st){
				//todo.
				var id = (st.id == undefined ? 'NULL' : st.id);
				var label = (st.label == undefined ? 'NULL' : `"${st.label}"`);
				var status = st.status;
				var taskId = task.id;

				//why not insert directly? for create_time. otherwise, create_time will lose.
				sqls.push(`INSERT INTO subtask (id, label, status, task_id) 
					VALUES (${id}, ${label}, ${status}, ${taskId})
					ON DUPLICATE KEY 
					UPDATE label=values(label), 
					status=values(status), 
					task_id=values(task_id)`);
			})
			var sql = sqls.join(';');
			return new Promise(function(resolve, reject){
	            conn.query(sql, function(err, result) {
	                if (err) {
	                    var errmsg = sql + '\n' + err.stack;
	                    reject(new Error(errmsg));
	                    return;
	                }
	                resolve(result);
	            })    
	        })
		}
		return [deleteByTaskId, insert];
	}
}

module.exports = SubTaskPersistence;






		