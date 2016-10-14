'use strict';
var dbpool = require('../db.js');
var Project  = require('../model/project.js');
var Property = require('../model/property.js');
var Util = require('../util.js');
var PropertyPersistence = require('./property.js');
var CurvePersistence = require('./curve.js');
var Task = require('../model/task.js');

var TaskPersistence = class TaskPersistence{
	constructor(){
		
	}
	
	static findByIds(ids){
		var startTime = Util.getOutTime('t.start_time');
		var endTime = Util.getOutTime('t.end_time');
		var idsClause = ids.join(',');
		var sql =`select t.id as task_id, t.label as task_label, ${startTime} as task_startTime, 
				${endTime} as task_endTime, t.\`desc\` as task_desc, t.priority as task_priority, 
				t.exp as task_exp, t.start_week as task_startWeek, t.end_week as task_endWeek, 
				t.template_type as task_templateType, t.project_id as task_projectId,
				
				st.id as subtask_id, st.label as subtask_label, st.status as subtask_status, 
				
				a.id as attachment_id, a.label as attachment_label, a.url as attachment_url,
				
				p.id as property_id, p.dropdown as property_dropdown, p.text as property_text,
				p.value as property_value, p.ref_key as property_ref_key, p.status as property_status,
				p.label as property_label, p.curve as property_curve, p.attachment as property_attachment, 
				p.image as property_image, p.\`key\` as property_key, 

				pw.id as property_wrap_id, pw.label as property_wrap_label

				from task t
				left join subtask st on (st.task_id = t.id and st.flag=0)
				left join attachment a on (a.task_id = t.id and a.flag=0)
				left join property_wrap pw on (pw.task_id = t.id and pw.flag=0)
				left join property p on (p.property_wrap_id = pw.id and p.flag=0)


				where t.id in (${idsClause})
				and t.flag = 0`;

				//query property_attachment, property_curve, property_image when expand cell_expander.
		console.log(sql);

		
		var wrap = function(rows){
			
			if(!rows || rows.length === 0){
				return "";
			}
			var tasks = {};

			rows.map(function(row){
				var id = row.task_id;
				tasks[id] = tasks[id] || row;

				tasks[id]['subtask'] = tasks[id]['subtask'] || {};
				if(row.subtask_id != undefined){
					tasks[id]['subtask'][row.subtask_id] = {
						id: row.subtask_id,
						label: row.subtask_label,
						status: row.subtask_status ? true: false,
					};
				}
				

				
				tasks[id]['attachment'] = tasks[id]['attachment'] || {};
				if(row.attachment_id != undefined){
					tasks[id]['attachment'][row.attachment_id] = {
						id: row.attachment_id,
						label: row.attachment_label,
						url: row.attachment_url
					}	
				}
				

				tasks[id]['propertyWrap'] = tasks[id]['propertyWrap']|| {};
				tasks[id]['propertyWrap'][row.property_wrap_id]  = tasks[id]['propertyWrap'][row.property_wrap_id] ||{};


				var sheets = tasks[id]['propertyWrap'][row.property_wrap_id].sheets || {};
				PropertyPersistence.wrapProperty(sheets, row);

				tasks[id]['propertyWrap'][row.property_wrap_id] = {
					sheetName: row.property_wrap_label,
					sheets: sheets
				};
				
			})


			
			var tasksObj = Object.keys(tasks).map(function(key){
				var task = tasks[key];
				return {
					id: task.task_id,
					projectId: task.task_projectId,
					label: task.task_label,
					startTime: task.task_startTime,
					endTime: task.task_endTime,
					desc: task.task_desc,
					priority: task.task_priority,
					exp: task.task_exp,
					startWeek: task.task_startWeek,
					endWeek: task.task_endWeek,
					subtask: Object.keys(task.subtask).map(function(st){
						return task.subtask[st]
					}),
					attachment: Object.keys(task.attachment).map(function(at){
						return task.attachment[at]
					}),
					template: {
						type: task.task_templateType,
						sheetNames: Object.keys(task.propertyWrap).map(function(key){
							return task.propertyWrap[key].sheetName;
						}),
						sheets: Object.keys(task.propertyWrap).map(function(key){
							var properties = task.propertyWrap[key].sheets;
							return Object.keys(properties).map(function(key){
								return properties[key];
							})
						})
					}
				}
			})
			return tasksObj;
		}

		return new Promise(function(resolve, reject){
            dbpool.execute(sql, function(err, rows){
                resolve({
                    err: err,
                    tasks: wrap(rows)
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

		var insertPropertyWrap = function(result, conn){
			var sheetNames = task.template.sheetNames;
			var sheets = task.template.sheets;
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
        	var sheets = task.template.sheets;
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
        if(task.template && task.template.sheets.length!=0){
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

	static deleteById(id, restore){
		var flag = restore ? 0: 1;
        var sql = `update task 
                    left join subtask on task.id=subtask.task_id
                    left join attachment a1 on task.id = a1.task_id
                    left join property_wrap on property_wrap.task_id=task.id
                        left join property p1 on p1.property_wrap_id=property_wrap.id
                            left join curve c1 on c1.property_id=p1.id
                            left join attachment a2 on a2.property_id=p1.id
                            left join image i1 on i1.property_id=p1.id
	                set 
	                    task.flag=${flag}, 
	                        subtask.flag =${flag},
	                        a1.flag = ${flag},
	                        property_wrap.flag = ${flag},
	                            p1.flag = ${flag},
	                                c1.flag = ${flag},
	                                a2.flag = ${flag},
	                                i1.flag = ${flag}
	                where task.id=${id}`;
        return new Promise(function(resolve, reject){
            dbpool.execute(sql, function(err, rows){
                resolve({
                    err: err,
                });
            });
        })
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

	static update(task, projectId){
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

		var deleteCurve = function(result, conn){
			var sheets = task.template.sheets;
        	var propertyIds = [];
        	sheets.map(function(sheet, index){
        		sheet.map(function(property){
        			if(CurvePersistence.isDefined(property.curve)){ /*todo: should in Curve data model.*/
	        			propertyIds.push(property.id);
	        		}
        		})
        	})
        	if(propertyIds.length === 0)
        		return Promise.resolve();

        	return CurvePersistence.delete(propertyIds, conn);
		}

		var insertCurve = function(result, conn){
			debugger;
			var sheets = task.template.sheets;
        	var curveParam = [];

        	sheets.map(function(sheet, index){
        		sheet.map(function(property){

        			var propertyId = property.id;	
        			if(CurvePersistence.isDefined(property.curve)){ /*todo: should in Curve data model.*/
	        			curveParam.push({
		        			curve: property.curve,
		        			propertyId: propertyId
		        		});
	        		}
        		})
        	})

        	if(curveParam.length === 0){
        		return Promise.resolve();
        	}

        	return CurvePersistence.insert(curveParam, conn);
		}

		var updateProperty = function(result, conn){
			//return for some reason.


			debugger;
			var insertCurveFirstId = result[0] ? result[0].insertId:undefined;
			var conditions = [];
			var params = [];
			var index = 0;

			var sheets = task.template.sheets;
			sheets.map(function(sheet){
				sheet.map(function(property){
					
					if(insertCurveFirstId){
						if(CurvePersistence.isDefined(property.curve)){ //todo: should in Curve data model.
							var curveId = insertCurveFirstId + index;
							property.curve = curveId;
							index ++;
						}else if(CurvePersistence.isNeed(property.curve)){
							property.curve = 0;
						}else if(CurvePersistence.notNeed(property.curve)){
							property.curve = 'NULL';
						}else{
							console.error('error in taskPersistence.update.');
						}	
					}else{
						property.curve = 'NULL';
					}
					



					conditions.push({
						key: 'id',
						value: property.id
					})
					params.push(property)
				})
			})
			return PropertyPersistence.update(conn, conditions, params);
		}

		var transactionArr = [[updateTask, deleteAllSubtask, insertSubtask, deleteAllAttachment, insertAttachment, deleteCurve], [insertCurve], [updateProperty]];
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

