'use strict';
var dbpool = require('../db.js');
var Project  = require('../model/project.js');
var Property = require('../model/property.js');
var Util = require('../util.js');
var PropertyPersistence = require('./property.js');
var Tasks = require('../model/tasks.js');

var TaskPersistence = class TaskPersistence{
	constructor(){
		
	}
	
	static findById(id){
		var startTime = Util.getOutTime('start_time');
		var endTime = Util.getOutTime('end_time');
		var sql = `select id, label, ${startTime} as startTime, 
				${endTime} as endTime, \`desc\`, priority, 
				exp, start_week, end_week, 
				template_type 
				from task
				where id=${id} and flag=0`;


		var getTaskTemplate = function(rows){
			return rows.map(function(row){
				var taskId = row.id;

				var sql = `select p.dropdown, p.text, p.value, 
						p.ref_key as refKey, p.status, p.label,
						p.curve, p.attachment, p.image,
						p.key, pw.id as property_wrap_id, pw.label as property_wrap_label

						from property p
						left join property_wrap pw on p.property_wrap_id=pw.id
						left join task t on t.id = pw.task_id

						where t.id=${taskId} 
						and t.flag=0 
						and p.flag=0 
						and pw.flag=0`;

				return new Promise(function(resolve, reject){
					dbpool.execute(sql, function(err, templateRows){
						if(err){
							reject(err);
							return;
						}
						resolve(templateRows);
					})
				})
			})
			
		}

		var assembleTask = function(taskParam, templateParam){
			var tmp = {};
			templateParam.map(function(p){
				tmp[p.property_wrap_id] = p.property_wrap_label;
			})

			var sheetNames = Object.keys(tmp).map(function(k){
				return tmp[k];
			})	

			var tmp2 = {}
			templateParam.map(function(propertyParam){
				if(!tmp2[propertyParam.property_wrap_id])
					tmp2[propertyParam.property_wrap_id] = [];

				var property = Property.create(propertyParam);
				tmp2[propertyParam.property_wrap_id].push(property.dump());
			})
			var sheets = Object.keys(tmp2).map(function(k){
				return tmp2[k];
			})

			return {
				id: taskParam.id,
				label: taskParam.label,
				startTime: taskParam.startTime,
				endTime: taskParam.endTime,
				desc: taskParam.desc,
				priority: taskParam.priority,
				exp: taskParam.exp, 
				startWeek: taskParam.startWeek,
				endWeek: taskParam.endWeek,
				template: {
					type: taskParam.template_type,
					sheetNames: sheetNames,
					sheets: sheets,
				}
			}	
		}

		return new Promise(function(resolve, reject){
			dbpool.execute(sql, function(err, rows){
				if(err){
					resolve({
						err: err
					})
					return;
				}

				Promise.all(getTaskTemplate(rows)).then(function(taskParams){
					var loop = rows.length;
					var tasksParam = [];
					for(var i=0; i<loop; i++){
						var task = assembleTask(rows[i], taskParams[i]);
						tasksParam.push(task);
					}

					var tasks = Tasks.create(tasksParam);
					resolve({rows: tasks.dump()});
				}, function(err){
					throw err
				}).catch(function(err){
					resolve({
						err: err
					})
				})
			});
		})
	}

	static insert(param){
		var insertTask = function(result, conn){
			var projectId = param.projectId;
	        var task = param.task;
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
                        reject(sql + '\n' + new Error(err.stack));
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
                        reject(sql + '\n' + new Error(err.stack));
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
                        reject(sql + '\n' + new Error(err.stack));
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
                        reject(sql + '\n' + new Error(err.stack));
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

	//problem.
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
                    reject(sql + '\n' + new Error(err.stack));
                    return;
                }
                resolve(result);
            })    
        })
	}
}
module.exports = TaskPersistence;

