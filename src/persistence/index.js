'use strict';
var dbpool = require('../db.js');
var Project  = require('../model/project.js');
var Property = require('../model/property.js');

var Persistence = class Persistence{
	constructor(){
		
	}
	
	static findTaskById(id){
		var sql = `select id, label, UNIX_TIMESTAMP(start_time)*1000 as startTime, 
				UNIX_TIMESTAMP(end_time)*1000 as endTime, \`desc\`, priority, 
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
		return new Promise(function(resolve, reject){
			dbpool.batch2(param, function(err, rows){
				resolve({
					err: err,
				});
			});
		})
	}
}
module.exports = Persistence;

