'use strict';
var dbpool = require('../db.js');
var Project  = require('../model/project.js');
var Util = require('../util.js');
var PropertyPersistence = require('./property.js');
var TaskPersistence = require('./task.js');
var EnginePersistence = require('./engine.js');

var ProjectPersistence = class ProjectPersistence {
	constructor(){
		
	}
    static update(param){
        var projectId = param.id;

        var updateProject = function(result, conn){
            var label = param.label;
            var sorp = param.sorp;
            var sql = `update project 
                set label = "${label}",
                sorp = ${Util.getInTime(sorp)}
                where id = ${projectId}`;

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

        var updateTag = function(result, conn){
            var tags = param.tags;
            if(tags.length === 0){
                return Promise.resolve({err: null})
            }

            var sql = tags.map(function(tag){
                var time = tag.time;
                var id = tag.id;
                var label = tag.label;
                return `update tag 
                    set time=${Util.getInTime(time)},
                    label = "${label}"
                    where id=${id}`;
            }).join(';');

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

        var updateTask = function(result, conn){
            return Promise.resolve()
        }

        var updateProperty = function(result, conn){
            var properties = param.properties;
            var conditions = properties.map(function(property){
                return {
                    key: 'id',
                    value: property.id
                }
            })
            var properties = param.properties;
            return PropertyPersistence.update(conn, conditions, properties);
        }
/*
        var selectEngine = function(result, conn){
            var sql = `select id from engine where project_id=${projectId}`;
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

        var updateEngine = function(result, conn){
            var engineOldIds = result.rows;
            var engineNewParam = param.engines;

            var update = function(result, conn){
                var updateParam = [];
                engineNewParam.map(function(engine){
                    if(engineOldIds.indexOf(engine.id)!=-1){
                        updateParam.push(engine);
                    }
                })
                return EnginePersistence.update(result, conn, updateParam);    
            }
            





            var deleteParams = function(){
                var deleteParam = [];
                engineOldIds.map(function(oldId){
                    var findEngine = engineNewParam.find(function(engine){
                        return engine.id === oldId;
                    })
                    if(!findEngine){
                        deleteParam.push(oldId);
                    }
                });
                return EnginePersistence.deleteByIds(conn, deleteParam);
            };


            var insertParams = function(){
                var insertParam = [];
                engineNewParam.map(function(engine){
                    if(engineOldIds.indexOf(engine.id)==-1){
                        insertParam.push(engine);
                    }
                })
                return EnginePersistence.insert(conn, insertparam);
            }

        }*/
        /*return new Promise(function(resolve, reject){
            dbpool.transaction([
                [updateProject, updateTag, updateTask, updateProperty], 
                [selectEngine],
                [updateEngine]
            ], function(err, rows){
                resolve({
                    err: err,
                });
            });
        });*/


        return new Promise(function(resolve, reject){
            dbpool.transaction([
                [updateProject, updateTag, updateTask, updateProperty]
            ], function(err, rows){
                resolve({
                    err: err,
                });
            });
        });
    }
	static insertProject(param){
		var insertProject = function(result, conn){
            var sql = `insert into project(creator_id, sorp, label) 
                    values (${param.creatorId}, ${Util.getInTime(param.sorp)}, "${param.label}")`;

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

		var insertTags = function(result, conn){
            var projectId = result[0].insertId;
            var tags = param.tags;

            var tagClause = tags.map(function(tag){
                var label = tag.label;
                var time = tag.time || 'NULL';
                var week = tag.week;
                return `("${label}", ${Util.getInTime(time)}, ${week}, ${projectId})`;
            }).join(',');
            var sql = `insert into tag(label, time, week, project_id) values ${tagClause}`;
            
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
                        var errmsg = sql + '\n' + err.stack;
                        reject(new Error(errmsg));
                        return;
                    }
                    resolve(result);
                });
            })
	    }


        var insertProperties = function(result, conn){
            var projectId = result[0].insertId;
            return PropertyPersistence.insertProperty.call(this, conn, [{
                properties: param.properties,
                foreignObj: {
                    key: 'project_id',
                    value: projectId
                }
            }])
        }

	    var insertEngines = function(result, conn){
            var projectId = result[0].insertId;
            return EnginePersistence.insert(conn, projectId, param.engines);
    	}


		return new Promise(function(resolve, reject){
			dbpool.transaction([
	    		[insertProject], 
	    		[insertTags, insertTasks, insertProperties, insertEngines]
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
                                    return;
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

    static deleteProjectById(projectId){
        var flag = 1;

        var sql = `update project 
                left join tag on tag.project_id=project.id
                left join task on task.project_id=project.id
                    left join subtask on task.id=subtask.task_id
                    left join attachment a1 on task.id = a1.task_id
                    left join property_wrap on property_wrap.task_id=task.id
                        left join property p1 on p1.property_wrap_id=property_wrap.id
                            left join curve c1 on c1.property_id=p1.id
                            left join attachment a2 on a2.property_id=p1.id
                            left join image i1 on i1.property_id=p1.id
                left join property p2 on p2.project_id=project.id
                    left join curve c2 on c2.property_id=p2.id
                    left join attachment a3 on a3.property_id=p2.id
                    left join image i2 on i2.property_id=p2.id
                left join engine on engine.project_id=project.id
                    left join property p3 on p3.engine_id=engine.id
                        left join curve c3 on c3.property_id=p3.id
                        left join attachment a4 on a4.property_id=p3.id
                        left join image i3 on i3.property_id=p3.id        
                set 
                project.flag = ${flag}
                    tag.flag=${flag}, 
                    task.flag=${flag}, 
                        subtask.flag =${flag},
                        a1.flag = ${flag},
                        property_wrap.flag = ${flag},
                            p1.flag = ${flag},
                                c1.flag = ${flag},
                                a2.flag = ${flag},
                                i1.flag = ${flag},
                    p2.flag = ${flag},
                        c2.flag = ${flag},
                        a3.flag = ${flag},
                        i2.flag = ${flag},
                    engine.flag = ${flag},
                        p3.flag = ${flag},
                            c3.flag = ${flag},
                            a4.flag = ${flag},
                            i3.flag = ${flag}
                where project.id=${projectId}`;

                

        return new Promise(function(resolve, reject){
            dbpool.execute(sql, function(err, rows){
                resolve({
                    err: err,
                });
            });
        })
    }
}
module.exports = ProjectPersistence;