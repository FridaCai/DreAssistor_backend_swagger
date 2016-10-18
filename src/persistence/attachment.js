'use strict';
var dbpool = require('../db.js');

var AttachmentPersistence = class AttachmentPersistence {
	constructor(){
		
	}
	
	static assembleUpdateHandlers(task){
		var deleteByTaskId = function(result, conn){
			var taskId = task.id;
			var sql = `delete from attachment where task_id=${taskId}`;
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
			if(task.attachment.length ===0 )
				return Promise.resolve();

			var sqls = [];
			task.attachment.map(function(at){
				var id = (at.id == undefined ? 'NULL' : at.id);
				var label = (at.label == undefined ? 'NULL' : `"${at.label}"`);
				var url = (at.url == undefined ? 'NULL' : `"${at.url}"`);
				var taskId = task.id;

				//why not insert directly? for create_time. otherwise, create_time will lose.
				sqls.push(`INSERT INTO attachment (id, label, url, task_id) 
					VALUES (${id}, ${label}, ${url}, ${taskId})
					ON DUPLICATE KEY 
					UPDATE label=values(label), 
					url=values(url), 
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

		return [deleteByTaskId, insert]
	}
}

module.exports = AttachmentPersistence;






		