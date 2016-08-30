'use strict';
var dbpool = require('../db.js');
var Project  = require('../model/project.js');

module.exports = class Persistence{
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

	static findProjects(param){
		var sqls = [`select creatorId, id, label, UNIX_TIMESTAMP(sorp) as sorp from project where flag=0`];

		if(param.userId != undefined)
			sqls.push(`and creatorId = ${param.userId}`);
		var sqlClause = sqls.join(' ');


		var getTags = function(projectId){
			var sql = `select id, label, UNIX_TIMESTAMP(time) as time, 
				week 
				from tag 
				where flag = 0 
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
			var sql = `select id, label, UNIX_TIMESTAMP(start_time) as startTime, 
				UNIX_TIMESTAMP(end_time) as endTime 
				from task
				where flag = 0 
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

		var getTasksAndTags = function(project){
			return Promise.all([
				getTasks(project.id),
				getTags(project.id)
			]).then(function(args){
				var tasks = args[0];
				var tags = args[1];
				if(tasks.err || tags.err){
					return({
						err: tasks.err || tags.err
					})
				}

				var tasks = args[0].rows;
				var tags = args[1].rows;
				project.setTasksByParam(tasks);
				project.setTagsByParam(tags);
				
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
					projectPromises.push(getTasksAndTags(project));	
				})
				
				Promise.all(projectPromises).then(function(args){
					debugger;
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

	static findProjectById(id){

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
