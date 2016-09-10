'use strict';
var dbpool = require('../db.js');
var Project  = require('../model/project.js');
var Property = require('../model/property.js');
var Util = require('../util.js');
var PropertyPersistence = require('./property.js');
var Task = require('../model/task.js');

var TaskPersistence = class TaskPersistence{
	constructor(){
		
	}
	
	static findById(id){
		var startTime = Util.getOutTime('t.start_time');
		var endTime = Util.getOutTime('t.end_time');
		var sql =`select t.id as task_id, t.label as task_label, ${startTime} as task_startTime, 
				${endTime} as task_endTime, t.\`desc\` as task_desc, t.priority as task_priority, 
				t.exp as task_exp, t.start_week as task_startWeek, t.end_week as task_endWeek, 
				t.template_type as task_templateType, t.project_id as task_projectId,
				
				st.id as subtask_id, st.label as subtask_label, st.status as subtask_status, 
				
				a.id as attachment_id, a.label as attachment_label, a.url as attachment_url,
				
				p.id as property_id, p.dropdown as property_dropdown, p.text as property_text,
				p.value as property_value, p.ref_key as property_refKey, p.status as property_status,
				p.label as property_label, p.curve as property_curve, p.attachment as property_attachment, 
				p.image as property_image, p.\`key\` as property_key, 

				pw.id as property_wrap_id, pw.label as property_wrap_label

				from task t
				left join subtask st on (st.task_id = t.id and st.flag=0)
				left join attachment a on (a.task_id = t.id and a.flag=0)
				left join property_wrap pw on (pw.task_id = t.id and pw.flag=0)
				left join property p on (p.property_wrap_id = pw.id and p.flag=0)


				where t.id = ${id}
				and t.flag = 0`;

				//query property_attachment, property_curve, property_image when expand cell_expander.


		
		var wrap = function(rows){
			if(!rows || rows.length === 0){
				return "";
			}

			var baseInfo = rows[0];
			var subtask = {};
			var attachment = {};
			var propertyWrap = {};

			rows.map(function(row){
				if(row.subtask_id != undefined){
					subtask[row.subtask_id] = {
						id: row.subtask_id,
						label: row.subtask_label,
						status: row.subtask_status
					}	
				}
				if(row.attachment_id != undefined){
					attachment[row.attachment_id] = {
						id: row.attachment_id,
						label: row.attachment_label,
						url: row.attachment_url
					}	
				}


				if(row.property_wrap_id != undefined){
					if(!propertyWrap[row.property_wrap_id]){
						propertyWrap[row.property_wrap_id] = {
							sheetName: row.property_wrap_label,
							sheets: []
						};
					}

					propertyWrap[row.property_wrap_id].sheets.push({
						id: row.property_id,
						key: row.property_key,
						label: row.property_label,
						dropdown: row.property_dropdown,
						text: row.property_text,
						value: row.property_value,
						refKey: row.property_refKey,
						status: row.property_status,
						curve: row.property_curve,
						attachment: row.property_attachment,
						image: row.property_image
					})
				}
			})

			var taskObj = {
				id: baseInfo.task_id,
				projectId: baseInfo.task_projectId,
				label: baseInfo.task_label,
				startTime: baseInfo.task_startTime,
				endTime: baseInfo.task_endTime,
				desc: baseInfo.task_desc,
				priority: baseInfo.task_priority,
				exp: baseInfo.task_exp,
				startWeek: baseInfo.task_startWeek,
				endWeek: baseInfo.task_endWeek,
				subtask: Object.keys(subtask).map(function(st){
					return subtask[st]
				}),
				attachment: Object.keys(attachment).map(function(at){
					return attachment[at]
				}),
				template: {
					type: baseInfo.task_templateType,
					sheetNames: Object.keys(propertyWrap).map(function(key){
						return propertyWrap[key].sheetName;
					}),
					sheets: Object.keys(propertyWrap).map(function(key){
						return propertyWrap[key].sheets;
					})
				}
			};
			var task = Task.create(taskObj);
			return task.dump();
		}

		return new Promise(function(resolve, reject){
            dbpool.execute(sql, function(err, rows){
                resolve({
                    err: err,
                    rows: wrap(rows)
                });
            });
        })
	}

	static insert(task, projectId){
		var insertTask = function(result, conn){
	        var label = task.label;
	        var startTime = Util.getInTime(task.startTime);
	        var endTime = Util.getInTime(task.endTime);
	        var desc = task.desc;
	        var priority = task.priority;
	        var exp = task.exp;
	        var startWeek = task.startWeek;
	        var endWeek = task.endWeek;
	        var templateType = task.template.type;

	        var sql = `insert into task(label, start_time, end_time, 
	            \`desc\`, priority, exp, 
	            start_week, end_week, template_type, 
	            project_id) 
	            values (
	                "${label}", ${startTime}, ${endTime},
	                "${desc}", ${priority}, "${exp}",
	                ${startWeek}, ${endWeek}, ${templateType},
	                ${projectId}
	            )`;

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



		//conn, sheetNames, taskId
		var insertPropertyWrap = function(result, conn){
			var sheetNames = param.task.template.sheetNames;
			var sheets = param.task.template.sheets;
			var taskId = result[0].insertId;

            var clause = sheetNames.map(function(sheetName){
                return `("${sheetName}", ${taskId})`
            }).join(',');

            var sql = `insert into property_wrap(label, task_id) values ${clause}`;

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

        var insertProperty = function(result, conn){
        	var sheets = param.task.template.sheets;
        	var insertId = result[0].insertId;
        	var propertyParam = [];

            sheets.map(function(sheet, index){
                var propertyWrapId = insertId + index;
            	propertyParam.push({
	                properties: sheet,
	                foreignObj: {
	                    key: 'property_wrap_id',
	                    value: propertyWrapId
	                }
	            })
            })
            return PropertyPersistence.insertProperty(conn, propertyParam);
        }

        var transactionArr = [[insertTask]];
        if(param.task.template && param.task.template.sheets.length!=0){
        	transactionArr.push([insertPropertyWrap]);
        	transactionArr.push([insertProperty]);
        }
		return new Promise(function(resolve, reject){
			dbpool.transaction(transactionArr, function(err, rows){
				resolve({
					err: (err ? err.stack: null)
				});
			});
		});
	}

	static deleteById(id){
		var condition = {
			key: 'id', 
			value: id
		};

		var selectPropertyIds = function(result, conn){
			var sql = `select p.id as id from property p
				left join property_wrap pw on p.property_wrap_id=pw.id
				where pw.task_id = ${id}`; 
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

		var deleteTask = function(result, conn){
			return TaskPersistence.delete(conn, condition);
		}



		var deletePropertyWrap = function(result, conn){
			var sql = `update property_wrap
                set flag = 1
                where task_id = ${id}`;

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
		var deleteProperty = function(result, conn){
			var propertyIds = result[0].map(function(row){
				return row.id
			})
			return PropertyPersistence.deleteByIds(conn, propertyIds);
		}

		var  transactionArr = [[selectPropertyIds], [deleteTask, deletePropertyWrap, deleteProperty]];
        return new Promise(function(resolve, reject){
            dbpool.transaction(transactionArr, function(err, rows){
                resolve({
                    err: err,
                });
            });
        });
		
	}

	static deleteByProjectId(conn, id){
		var condition = {
			key: 'project_id', 
			value:id
		}
		return TaskPersistence.delete(conn, condition);		
	}

	static delete(conn, condition){
		var id = (condition.key === 'id') ? condition.value:'NULL';
		var projectId = (condition.key === 'project_id') ? condition.value:'NULL';

		var sql = `update task t
			left join subtask st on t.id = st.task_id
			left join attachment a on t.id = a.task_id
			left join property_wrap pw on t.id = pw.task_id
			set t.flag=1, st.flag=1, a.flag=1, pw.flag=1
			where t.id=${id} 
			or t.project_id=${projectId}`;

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

	static update(task){
		var updateTask = function(result, conn){
			var taskId = task.id;
			var label = task.label;
			var startTime = Util.getInTime(task.startTime);
	        var endTime = Util.getInTime(task.endTime);
			var desc = task.desc;
			var priority = task.priority;
			var exp = task.exp;
			var startWeek = task.startWeek;
	        var endWeek = task.endWeek;
	        var templateType = task.template.type;
	        var projectId = task.projectId; //takecare...
	        
	        var sql = `update task set
	        	label = "${label}",
	        	start_time = ${startTime},
				end_time = ${endTime},
				\`desc\` = "${desc}",
				priority = ${priority},
				exp = "${exp}",
				start_week = ${startWeek},
				end_week = ${endWeek},
				template_type = ${templateType},
				project_id = ${projectId} 
				where id=${taskId}`;

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

		var deleteAllSubtask = function(result, conn){
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
		var insertSubtask = function(result, conn){
			if(task.subtask.length ===0 )
				return Promise.resolve();

			var sqls = [];
			task.subtask.map(function(st){
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
		var deleteAllAttachment = function(result, conn){
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
		var insertAttachment = function(result, conn){
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
		var updateProperty = function(result, conn){
			var conditions = [];
			var params = [];

			var sheets = task.template.sheets;
			sheets.map(function(sheet){
				sheet.map(function(property){
					conditions.push({
						key: 'id',
						value: property.id
					})
					params.push(property)
				})
			})
			PropertyPersistence.update(conn, conditions, params);
		}

		var transactionArr = [[updateTask, deleteAllSubtask, insertSubtask, deleteAllAttachment, insertAttachment, updateProperty]];
        return new Promise(function(resolve, reject){
            dbpool.transaction(transactionArr, function(err, rows){
                resolve({
                    err: err,
                });
            });
        });

	}
}
module.exports = TaskPersistence;

