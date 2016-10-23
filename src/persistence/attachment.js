'use strict';
var dbpool = require('../db.js');

var AttachmentPersistence = class AttachmentPersistence {
	constructor(){
		
	}
	

	//todo: wrong. please correct it. attachment. taskId or proeprtyId.
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
				var guid = (at.guid == undefined ? 'NULL' : `"${at.guid}"`);
				var taskId = task.id;

				//why not insert directly? for create_time. otherwise, create_time will lose.
				sqls.push(`INSERT INTO attachment (id, label, guid, task_id) 
					VALUES (${id}, ${label}, ${guid}, ${taskId})
					ON DUPLICATE KEY 
					UPDATE label=values(label), 
					guid=values(guid), 
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

	static isDefined(attachment){
		if(attachment != undefined){
			return true;
		}
		return false;
	}

	static insert(condition, conn){
		var clauseArr = [];

		condition.map(function(c){
			var ats = c.attachment;
			var propertyId = (c.propertyId == undefined) ? 'NULL': `"${c.propertyId}"`;
			var taskId = (c.taskId == undefined) ? 'NULL': `"${c.taskId}"`;

			ats.map(function(at){
				var guid = at.guid; //assert, if guid not exist, error
				var label = at.label;
				clauseArr.push(`("${label}", "${guid}", ${taskId}, ${propertyId})`);	
			})
		});
		
		var clauses = clauseArr.join(',');
		var sql = `insert into attachment(
			label, guid, task_id, property_id
        ) values ${clauses}`;

        console.log(sql);
        return new Promise(function(resolve, reject){
            conn.query(sql, function(err, result) {
                if (err) {
                    var errmsg = sql + '\n' + err.stack;
                    reject(new Error(errmsg));
                    return;
                }
                resolve(result);
            });
        })
	}

	static findByTaskId(id){
		var sql = `select * from attachment where task_id = ${id}`;
		var wrap = function(rows){
			if(!rows || rows.length === 0){
				return "";
			}
			
			return rows.map(function(row){
				return {
					id: row.id,
					label: row.label,
					guid: row.guid
				}
			});
		}
		return new Promise(function(resolve, reject){
            dbpool.execute(sql, function(err, rows){
                resolve({
                    err: err,
                    attachment: wrap(rows)
                });
            });
        })
	}

	static findByPropertyId(id){
		var sql = `select * from attachment where property_id = ${id}`;
		var wrap = function(rows){
			if(!rows || rows.length === 0){
				return "";
			}
			
			return rows.map(function(row){
				return {
					id: row.id,
					label: row.label,
					guid: row.guid	
				}
			});
		}
		return new Promise(function(resolve, reject){
            dbpool.execute(sql, function(err, rows){
                resolve({
                    err: err,
                    attachment: wrap(rows)
                });
            });
        })
	}
}

module.exports = AttachmentPersistence;






		