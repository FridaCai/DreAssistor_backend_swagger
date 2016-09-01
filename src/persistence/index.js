'use strict';
var dbpool = require('../db.js');
var Project  = require('../model/project.js');

var Persistence = class Persistence{
	constructor(){
		
	}

	static insertUser(param){
		var name = param.name;
		var email = param.email;
		var password = param.password;
		var sql = `insert into user(name, password, email) 
    		values ("${name}", "${password}", "${email}")`;


		return new Promise(function(resolve, reject){
			dbpool.execute(sql, function(err, rows){
				resolve({
					err: err,
					rows: rows
				});
			});
		})
	}

	static findUserByEmail(email){
		var sql = `select * from user where email = "${email}" and flag = 0`;
		return new Promise(function(resolve, reject){
			dbpool.execute(sql, function(err, rows){
				resolve({
					err: err,
					rows: rows
				});
			});
		})
	}

	static findUserById(id){
		var sql = `select * from user where id = "${id}" and flag = 0`;
		return new Promise(function(resolve, reject){
			dbpool.execute(sql, function(err, rows){
				resolve({
					err: err,
					rows: rows
				});
			});
		}) 
	}
	static insertProject(param){
		return new Promise(function(resolve, reject){
			dbpool.batch(param, function(err, rows){
				resolve({
					err: err,
				});
			});
		})
	}


	/*
		if performance has problem, not retrieve properties and engines when get/projects
		gain tasks, tags, engines, properties when query project by id.
	*/
	static findProjects(param){
		var sqls = [
			`select creatorId, id, label, 
			UNIX_TIMESTAMP(sorp)*1000 as sorp 
			from project 
			where flag=0 `
		];

		if(param.id != undefined){
			sqls.push(`and id=${param.id}`);
		}else{
			if(param.userId != undefined)
				sqls.push(`and creatorId=${param.userId}`);	
		}

		sqls.push('order by id desc');
		

		var sqlClause = sqls.join(' ');


		var getProjects = function(){
			return new Promise(function(resolve, reject){
				dbpool.execute(sqlClause, function(err, rows){
					var projects = rows.map(function(row){
						return Project.create({
							id: row.id,
							creatorId: row.creatorId,
							label: row.label,
							sorp: row.sorp
						})
					})
					resolve(projects);
				})
			})
		}

		var getTags = function(projectId){
			var sql = `select id, label, UNIX_TIMESTAMP(time)*1000 as time, 
				week 
				from tag 
				where flag=0 
				and projectId=${projectId}`;


			return new Promise(function(resolve, reject){
				dbpool.execute(sql, function(err, rows){
					resolve({
						err: err,
						rows: rows
					});
				});
			})
		}

		var getTasks = function(projectId){
			var sql = `select id, label, UNIX_TIMESTAMP(start_time)*1000 as startTime, 
				UNIX_TIMESTAMP(end_time)*1000 as endTime 
				from task
				where flag=0 
				and projectId=${projectId}`;


			return new Promise(function(resolve, reject){
				dbpool.execute(sql, function(err, rows){
					resolve({
						err: err,
						rows: rows
					});
				});
			})
		}

		var getProperties = function(projectId){
			var sql = `select id, dropdown, text, 
				value, ref_key, status, 
				label, \`key\` 
				from property where flag=0 and projectId=${projectId}`;

			return new Promise(function(resolve, reject){
				dbpool.execute(sql, function(err, rows){
					resolve({
						err: err,
						rows: rows
					});
				});
			})
		}

		var getEngines = function(projectId){debugger;
			var sql = `select id from engine where flag=0 and projectId=${projectId}`;

			return new Promise(function(resolve, reject){
				dbpool.execute(sql, function(err, rows){

					if(err){
						resolve({
							err: err,
						});
						return;
					}

					var promiseArr = [];
					rows.map(function(row){
						var engineId = row.id;

						var sql = `select id, dropdown, text, 
							value, ref_key, status, 
							label, \`key\`
							from property 
							where engineId=${engineId} 
							and flag=0`;

						promiseArr.push(new Promise(function(resolve, reject){
							dbpool.execute(sql, function(err, rows){
								debugger;
								if(err){
									reject(err);
								}
								resolve(rows);	
							})
						}))
					});

					Promise.all(promiseArr).then(function(engineParams){

						resolve({
							rows: engineParams.map(function(engineParam, index){
								return {
									id: rows[index].id,
									properties: engineParam
								}
							}),
							err: null	
						});
					}, function(err){
						throw err;
					}).catch(function(err){
						resolve({
							err: err
						});
					})
				});
			})
		}

		var getOtherInfo = function(project){
			return Promise.all([
				getTasks(project.id),
				getTags(project.id),
				getEngines(project.id),
				getProperties(project.id)
			]).then(function(args){
				var tasks = args[0];
				var tags = args[1];
				var engines = args[2];
				var properies = args[3];
				debugger;



				var err = tasks.err || tags.err || properies.err || engines.err;
				if(err){
					return({
						err: err
					})
				}

				var tasks = args[0].rows;
				var tags = args[1].rows;
				var engines = args[2].rows;
				var properties = args[3].rows;
				
				project.setTasksByParam(tasks);
				project.setTagsByParam(tags);
				project.setEnginesByParam(engines);
				project.setPropertiesByParam(properties);
				
				return({
					err: null,
					project: project
				})
			}, function(){
				debugger;
			})
		}

		return new Promise(function(resolve, reject){
			getProjects().then(function(projects){
				var projectPromises = [];
				projects.map(function(project){
					projectPromises.push(getOtherInfo(project));	
				})
				
				Promise.all(projectPromises).then(function(args){
					var projects = [];
					for(var i=0; i<args.length; i++){
						var arg = args[i];

						if(arg.err){
							resolve({
								err: err,
							});	
							return;
						}

						projects.push(arg.project)
					}
					
					resolve({
						err: null,
						projects: projects
					});	
				})
			})
	
		})
	}

	static findProjectById(param){
		return Persistence.findProjects(param);
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

