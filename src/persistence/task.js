'use strict';
var dbpool = require('../db.js');
var Project  = require('../model/project.js');
var Property = require('../model/property.js');
var Util = require('../util.js');

var TaskPersistence = class TaskPersistence{
	constructor(){
		
	}
	
	static findTaskById(id){
		var startTime = Util.getOutTime('startTime');
		var endTime = Util.getOutTime('endTime');
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
						p.ref_key, p.status, p.label,
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
					var returnTasks = [];
					for(var i=0; i<loop; i++){
						var task = assembleTask(rows[i], taskParams[i]);
						returnTasks.push(task);
					}
					resolve({rows: returnTasks});
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

	static addTask(param){
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
                    }
                    resolve(result);
                })    
            })
        }

        var insertProperty = function(result, conn){
        	var sheets = param.task.template.sheets;
        	var insertId = result[0].insertId;

            var propertyClause = sheets.map(function(sheet, index){
                var propertyWrapId = insertId + index;

                return sheet.map(function(property){
                    //undefined; null; 0; ''
                    var dropdown = (property.dropdown == undefined) ? 'NULL': property.dropdown; 
                    var text = (property.text == undefined) ? 'NULL': `"${property.text}"`;
                    var value = (property.value == undefined) ? 'NULL': `"${property.value}"`;
                    var refKey = (property.refKey == undefined) ? 'NULL': `"${property.refKey}"`;
                    var status = (property.status == undefined) ? 'NULL': `${property.status}`;
                    var label = (property.label == undefined) ? 'NULL': `"${property.label}"`;
                    var key = `"${property.key}"`;
                    return `(
                        ${dropdown}, ${text}, ${value}, 
                        ${refKey}, ${status}, ${label}, 
                        ${key}, ${propertyWrapId}
                    )`;
                }).join(',')
                
            }).join(',');

            var sql = `insert into property(
                dropdown, text, value, 
                ref_key, status, label,
                \`key\`, property_wrap_id
            ) values ${propertyClause}`;

        	return new Promise(function(resolve, reject){
                conn.query(sql, function(err, result) {
                    if (err) {
                        reject(sql + '\n' + new Error(err.stack));
                    }
                    resolve(result);
                })    
            })
        }

        var transactionArr = [[insertTask]];
        if(param.task.template || param.task.template.sheets.length!=0){
        	transactionArr.push([insertPropertyWrap]);
        	transactionArr.push([insertProperty]);
        }
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

