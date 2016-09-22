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


        var transactionArr = [[updateProject, updateTag, updateTask, updateProperty]];
        var engineArr = EnginePersistence.assembleUpdateHandlers(param.engines, projectId);
        transactionArr = transactionArr.concat(engineArr);
        return new Promise(function(resolve, reject){
            dbpool.transaction(transactionArr, function(err, rows){
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
            return EnginePersistence.insertEngine(conn, projectId, param.engines);
    	}
        var insertEngineProperties = function(result, conn){
            return EnginePersistence.insertProperties(result, conn, param.engines);
        }

		return new Promise(function(resolve, reject){
			dbpool.transaction([
	    		[insertProject], 
	    		[insertEngines, insertTags, insertTasks, insertProperties],
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
    static findProjectById(id){
        //too complex.
        /*
            set @projectId=210;
            select p.id as project_id, p.label as project_label, p.creator_id as project_creator_id, 
                p.sorp as project_sorp,
                
                t.id as tag_id, t.label as tag_label, 
                UNIX_TIMESTAMP(t.time)*1000 as tag_time, t.week as tag_week,
                
                ta.id as task_id, ta.label as task_label, 
                UNIX_TIMESTAMP(ta.start_time)*1000 as task_starttime, 
                UNIX_TIMESTAMP(ta.end_time)*1000 as task_endtime,
                
                pro.id as property_id, pro.dropdown as property_dropdown, pro.text as property_text,
                pro.value as property_value, pro.ref_key as property_ref_key, pro.status as property_status,
                pro.label as property_label, pro.`key` as property_key, pro.curve as property_curve,
                pro.attachment as property_attachment, pro.image as property_image,
                
                epro.id as engine_property_id, epro.dropdown as engine_property_dropdown, epro.text as engine_property_text,
                epro.`value` as engine_property_value, epro.ref_key as engine_property_ref_key, epro.status as engine_property_status,
                epro.label as engine_property_label, epro.`key` as engine_property_key, epro.curve as engine_property_curve,
                epro.attachment as engine_property_attachment, epro.image as engine_property_image
                
                
            from project p 
            left join tag t on (t.project_id=p.id and t.flag=0)
            left join task ta on (ta.project_id=p.id and ta.flag=0)
            left join property pro on (pro.project_id=p.id and pro.flag=0)
            left join `engine` e on e.project_id=p.id and e.flag=0
            left join property epro on epro.engine_id =e.id and epro.flag=0

            where p.flag=0 
            and p.id=@projectId;
        */
        var getProjects = function(){
            var sorp = Util.getOutTime('sorp');
            var sqls = [
                `select creator_id, id, label, 
                ${sorp} as sorp 
                from project 
                where flag=0 
                and id=${id}`
            ];

            
             
            var sqlClause = sqls.join(' ');
            return new Promise(function(resolve, reject){
                dbpool.execute(sqlClause, function(err, rows){
                    var projects = rows.map(function(row){
                        return Project.create({
                            id: row.id,
                            creatorId: row.creator_id,
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
            var sql = `select id from engine where flag=0 and project_id=${projectId} order by id desc`;

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
                        project: projects[0] //bad.
                    }); 
                })
            })
    
        })
    }

    static findProjects(param){
        var startTime = Util.getOutTime('task.start_time');
        var endTime = Util.getOutTime('task.end_time');
        var tagTime = Util.getOutTime('tag.time');
        var sorp = Util.getOutTime('p.sorp ');

        var sqls = [`select p.id as project_id, p.label as project_label, ${sorp} as project_sorp, 
            p.creator_id as project_creator_id, task.id as task_id,
            task.label as task_label, ${startTime} as task_startTime, ${endTime} as task_endTime,
            tag.id as tag_id, tag.label as tag_label, ${tagTime} as tag_time, tag.week as tag_week
            from project p
            left join task on (p.id = task.project_id and task.flag=0)
            left join tag on (p.id = tag.project_id and tag.flag=0)
            where p.flag=0`];//todo: add offset and limit;
 
        if(param.userId != undefined)
            sqls.push(`and p.creator_id=${param.userId}`);
        var sql = sqls.join(' ')

        var wrap = function(rows){
            var projects = {};
            
            rows.map(function(row){
                var projectId = row.project_id;
                var projectLabel = row.project_label;
                var projectSorp = row.project_sorp;
                var projectCreatorId = row.project_creator_id;
                
                var taskId = row.task_id;
                var taskLabel = row.task_label;
                var taskStartTime = row.task_startTime;
                var taskEndTime = row.task_endTime;

                var tagId = row.tag_id;
                var tagLabel = row.tag_label;
                var tagTime = row.tag_time;
                var tagWeek = row.tag_week;

                projects[projectId] = projects[projectId] || {
                    id: projectId,
                    label: projectLabel,
                    sorp: projectSorp,
                    creatorId: projectCreatorId,
                    tasks: {}, 
                    tags: {},
                }

                projects[projectId].tasks[taskId] = projects[projectId].tasks[taskId] || {
                    id: taskId,
                    label: taskLabel,
                    startTime: taskStartTime,
                    endTime: taskEndTime
                }   

                projects[projectId].tags[tagId] = projects[projectId].tags[tagId] || {
                    id: tagId,
                    label: tagLabel,
                    time: tagTime,
                    week: tagWeek
                }
            })

            var returnArr = Object.keys(projects).map(function(key){
                var project = projects[key];
                return {
                    id: project.id,
                    label: project.label,
                    sorp: project.sorp,
                    tasks: Object.keys(project.tasks).map(function(key){
                        return (project.tasks[key])
                    }),
                    tags: Object.keys(project.tags).map(function(key){
                        return project.tags[key];
                    })
                }
            })
            returnArr.reverse();  //might have problem.
            return returnArr;
        }

        return new Promise(function(resolve, reject){
            dbpool.execute(sql, function(err, rows){
                resolve({
                    err: err,
                    projects: wrap(rows)
                });
            });
        })
    }

    static deleteProjectById(projectId, restore){
        var flag = restore ? 0: 1;

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
                project.flag = ${flag},
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