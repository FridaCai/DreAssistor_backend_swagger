'use strict';
var dbpool = require('../db.js');
var Project  = require('../model/project.js');
var Util = require('../util.js');
var PropertyPersistence = require('./property.js');
var TaskPersistence = require('./task.js');

var ProjectPersistence = class ProjectPersistence {
	constructor(){
		
	}

	static insertProject(param){
		var insertProject = function(result, conn){
            var sql = `insert into project(creator_id, sorp, label) 
                    values (${param.creatorId}, ${Util.getInTime(param.sorp)}, "${param.label}")`;

            return new Promise(function(resolve, reject){
                conn.query(sql, function(err, result) {
                    if (err) {
                        reject(sql + '\n' + new Error(err.stack));
                    }
                    resolve(result);
                })    
            })
			
		}

		var insertTags = function(result, conn){
            var projectId = result[0].insertId;
            var tags = param.tags;

            var tagClause = tags.map(function(tag){
                var label = tag.label;
                var time = tag.time;
                var week = tag.week;
                return `("${label}", ${Util.getInTime(time)}, ${week}, ${projectId})`;
            }).join(',');
            var sql = `insert into tag(label, time, week, project_id) values ${tagClause}`;
            
            return new Promise(function(resolve, reject){
                conn.query(sql, function(err, result) {
                    if (err) {
                        reject(sql + '\n' + new Error(err.stack));
                    }
                    resolve(result);
                });
            })
		}

		var insertTasks = function(result, conn){
            var projectId = result[0].insertId;
            var tasks = param.tasks;

            var taskClause = tasks.map(function(task){
                var label = task.label;
                var startTime = task.startTime;
                var endTime = task.endTime;
                var desc = task.desc;
                var exp = task.exp;
                var priority = task.priority;
                var startWeek = task.startWeek;
                var endWeek = task.endWeek;
                var templateType = task.template.type;

                return `("${label}", ${Util.getInTime(startTime)},${Util.getInTime(endTime)}, 
                    "${desc}", "${exp}",  ${priority}, 
                    ${startWeek}, ${endWeek}, ${templateType}, 
                    ${projectId})`;
            }).join(',');
            
            var sql = `insert into task(
                label, start_time, end_time, 
                \`desc\`, exp, priority, 
                start_week, end_week, template_type, 
                project_id
            ) values ${taskClause}`;

            return new Promise(function(resolve, reject){
                conn.query(sql, function(err, result) {
                    if (err) {
                        reject(sql + '\n' + new Error(err.stack));
                    }
                    resolve(result);
                });
            })
	    }


        var insertProperties = function(result, conn){
            var projectId = result[0].insertId;
            return PropertyPersistence.insertProperty.call(this, conn, {
                properties: param.properties,
                foreignObj: {
                    key: 'project_id',
                    value: projectId
                }
            })
        }

	    var insertEngines = function(result, conn){
            var projectId = result[0].insertId;
            var engines = param.engines;
            var engineClause = engines.map(function(engine){
                return `(
                    ${projectId}
                )`; 
            }).join(',');

            var sql = `insert into engine(project_id) values ${engineClause}`;

            return new Promise(function(resolve, reject){
                conn.query(sql, function(err, result) {
                    if (err) {
                        reject(sql + '\n' + new Error(err.stack));
                    }
                    resolve(result);
                });    
            })
            
    	}

    	var insertEngineProperties = function(result, conn){
            var affectedRows = result[3].affectedRows;
            var insertId = result[3].insertId;
            var engines = param.engines;

            var param = [];

            for(var i=0; i<affectedRows; i++){
                var engineId = insertId + i;
                var properties = engines[i].properties;

                param.push({
                    properties: properties,
                    foreignObj: {
                        key: 'engine_id',
                        value: engineId
                    }
                })
	       }
           return PropertyPersistence.insertProperty.call(this, conn, param);   
       }

		return new Promise(function(resolve, reject){
			dbpool.transaction([
	    		[insertProject], 
	    		[insertTags, insertTasks, insertProperties, insertEngines],
	    		[insertEngineProperties]
			], function(err, rows){
				resolve({
					err: err,
				});
			});
		});
	}

    /*
        if performance has problem, not retrieve properties and engines when get/projects
        gain tasks, tags, engines, properties when query project by id.
    */
    static findProjects(param){
        var sorp = Util.getOutTime('sorp');
        var sqls = [
            `select creator_id, id, label, 
            ${sorp} as sorp 
            from project 
            where flag=0 `
        ];

        if(param.id != undefined){
            sqls.push(`and id=${param.id}`);
        }else{
            if(param.userId != undefined)
                sqls.push(`and creator_id=${param.userId}`);    
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
            var time = Util.getOutTime('time');
            var sql = `select id, label, ${time} as time, 
                week 
                from tag 
                where flag=0 
                and project_id=${projectId}`;


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
            var startTime = Util.getOutTime('start_time');
            var endTime = Util.getOutTime('end_time');
            var sql = `select id, label, ${startTime} as startTime, 
                ${endTime} as endTime 
                from task
                where flag=0 
                and project_id=${projectId}`;


            return new Promise(function(resolve, reject){
                dbpool.execute(sql, function(err, rows){
                    if(err){
                        resolve({
                            err: err
                        })
                        return;
                    }

                    resolve({
                        rows: rows
                    })
                });
            })
        }

        var getProperties = function(projectId){
            var sql = `select id, dropdown, text, 
                value, ref_key, status, 
                label, \`key\`, curve, 
                attachment, image 
                from property 
                where flag=0 
                and project_id=${projectId}`;

            return new Promise(function(resolve, reject){
                dbpool.execute(sql, function(err, rows){
                    resolve({
                        err: err,
                        rows: rows
                    });
                });
            })
        }

        var getEngines = function(projectId){
            var sql = `select id from engine where flag=0 and project_id=${projectId}`;

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
                            label, \`key\`, curve,
                            image, attachment
                            from property 
                            where engine_id=${engineId} 
                            and flag=0`;

                        promiseArr.push(new Promise(function(resolve, reject){
                            dbpool.execute(sql, function(err, rows){
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
        return ProjectPersistence.findProjects(param);
    }

    static deleteProjectById(param){
        var id = param.id;

        var deleteProject = function(result, conn){
            var sql = `update project
                set flag = 1
                where id = ${id}`;

            return new Promise(function(resolve, reject){
                conn.query(sql, function(err, result) {
                    if (err) {
                        reject(sql + '\n' + new Error(err.stack));
                    }
                    resolve(result);
                })    
            })
        }
        var deleteTask = function(result, conn){
            return TaskPersistence.deleteByProjectId(conn, id);
        }


        var deleteTag = function(result, conn){
            return TagPersistence.deleteByProjectId(conn, id);
        }

        var deleteProperty = function(result, conn){
            return PropertyPersistence.deleteByProjectId(conn, id);
        }

        var deleteEngine = function(result, conn){
            return EnginePersistence.deleteByProjectId(conn, id);
        }


        var transactionArr = [[deleteProject, deleteTask, deleteTag, deleteProperty, deleteEngine]];
        return new Promise(function(resolve, reject){
            dbpool.transaction(transactionArr, function(err, rows){
                resolve({
                    err: err,
                });
            });
        });
    }
}
module.exports = ProjectPersistence;