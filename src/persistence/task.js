'use strict';
var dbpool = require('../db.js');
var Project  = require('../model/project.js');
var Property = require('../model/property.js');
var Util = require('../util.js');
var PropertyPersistence = require('./property.js');
var CurvePersistence = require('./curve.js');
var Task = require('../model/task.js');
var SubTaskPersistence = require('./subtask.js');
var AttachmentPersistence = require('./attachment.js');

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
				t.template_type as task_templateType, t.project_id as task_projectId, t.creator_id as task_creatorId,
				t.privacy as task_privacy, t.mark_color as task_markColor,

				st.id as subtask_id, st.label as subtask_label, st.status as subtask_status, 
				
				a.id as attachment_id, a.label as attachment_label, a.guid as attachment_guid,
				
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
						guid: row.attachment_guid
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
					creatorId: task.task_creatorId,
					privacy: task.task_privacy,
					markColor: task.task_markColor,
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

	static insert(task, projectId, creatorId){
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
	        var privacy = task.privacy;
	        var markColor = task.markColor;
	        

	        var sql = `insert into task(label, start_time, end_time, 
	            \`desc\`, priority, exp, 
	            start_week, end_week, template_type, 
	            project_id, creator_id, privacy, mark_color) 
	            values (
	                "${label}", ${startTime}, ${endTime},
	                "${desc}", ${priority}, "${exp}",
	                ${startWeek}, ${endWeek}, ${templateType},
	                ${projectId}, ${creatorId}, ${privacy}, ${markColor} 
	            )`;

            return new Promise(function(resolve, reject){
				dbpool.singleExecute(conn, sql, function(err, result) {
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
				dbpool.singleExecute(conn, sql, function(err, result) {
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
            return PropertyPersistence.insertProperty(propertyParam, result, conn);
        }

      
        var transactionArr = [[insertTask]];
        if(task.template && task.template.sheets.length!=0){
        	transactionArr.push([insertPropertyWrap]);
        	transactionArr.push([insertProperty]);
        }
		return new Promise(function(resolve, reject){
			dbpool.transaction(transactionArr, function(err, rows){
				resolve({
					err: err
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
			dbpool.singleExecute(conn, sql, function(err, result) {
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
	        var privacy = task.privacy;
	        var markColor = task.markColor
	        
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
				project_id = ${projectId},
				mark_color = ${markColor},
				privacy = ${privacy} 
				where id=${taskId}`;

            return new Promise(function(resolve, reject){
				dbpool.singleExecute(conn, sql, function(err, result) {
                    if (err) {
                        var errmsg = sql + '\n' + err.stack;
                        reject(new Error(errmsg));
                        return;
                    }
                    resolve(result);
                })    
            })
		}

		var updateSubTask = function(){
			return SubTaskPersistence.assembleUpdateHandlers(task);
		}

		var updateAttachment = function(result, conn){
			var condition = [];
			task.attachment.map(function(at){
				condition.push({
					attachment: at,
					taskId: task.id
				});
			})

			if(condition.length === 0){
	     		return []; //work? not sure.
	     	}

			return AttachmentPersistence.update(result, conn, condition);
		}


		var updateProperty = function(result, conn){
			var properties = [];
			task.template.sheets.map(function(sheet){
				sheet.map(function(property){
					properties.push(property);
				})
			})
			return PropertyPersistence.assembleUpdateHandlers(properties, result, conn);
		}

		var transactionArr = [updateTask, updateAttachment].concat(updateSubTask());
		transactionArr = [transactionArr, [updateProperty]];

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

