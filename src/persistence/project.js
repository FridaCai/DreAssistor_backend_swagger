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
    /*
        sql:
set @projectId=211;
select p.id as project_id, p.label as project_label, p.creator_id as project_creator_id, 
                UNIX_TIMESTAMP(p.sorp)*1000 as project_sorp,
                
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
    static findProjectById(id){
        var sql = `select p.id as project_id, p.label as project_label, p.creator_id as project_creator_id, 
                ${Util.getOutTime('p.sorp')} as project_sorp,
                
                t.id as tag_id, t.label as tag_label, 
                ${Util.getOutTime('t.time')} as tag_time, t.week as tag_week,
                
                ta.id as task_id, ta.label as task_label, 
                ${Util.getOutTime('ta.start_time')} as task_starttime, 
                ${Util.getOutTime('ta.end_time')} as task_endtime,
                
                pro.id as property_id, pro.dropdown as property_dropdown, pro.text as property_text,
                pro.value as property_value, pro.ref_key as property_ref_key, pro.status as property_status,
                pro.label as property_label, pro.\`key\` as property_key, pro.curve as property_curve,
                pro.attachment as property_attachment, pro.image as property_image,
                
                e.id as engine_id,
                epro.id as engine_property_id, epro.dropdown as engine_property_dropdown, epro.text as engine_property_text,
                epro.\`value\` as engine_property_value, epro.ref_key as engine_property_ref_key, epro.status as engine_property_status,
                epro.label as engine_property_label, epro.\`key\` as engine_property_key, epro.curve as engine_property_curve,
                epro.attachment as engine_property_attachment, epro.image as engine_property_image
                
                
            from project p 
            left join tag t on (t.project_id=p.id and t.flag=0)
            left join task ta on (ta.project_id=p.id and ta.flag=0)
            left join property pro on (pro.project_id=p.id and pro.flag=0)
            left join \`engine\` e on e.project_id=p.id and e.flag=0
            left join property epro on epro.engine_id =e.id and epro.flag=0

            where p.flag=0 
            and p.id=${id};`;  



        var wrap = function(rows){
            //todo: engine. order by id desc.            
            //todo: if property value/text... === null, do not return please.
            
            var row0 = rows[0];

            var project = {
                id: row0.project_id,
                label: row0.project_label,
                creatorId: row0.project_creator_id,
                sorp: row0.project_sorp,
                tasks: {},
                tags: {},
                properties: {},
                engines: {}
            };
            rows.map(function(row){
                project.tags[row.tag_id] = project.tags[row.tag_id] || {
                    id: row.tag_id,
                    label: row.tag_label,
                    time: row.tag_time,
                    week: row.tag_week
                }

                project.tasks[row.task_id] = project.tasks[row.task_id] || {
                    id: row.task_id,
                    label: row.task_label,
                    startTime: row.task_starttime,
                    endTime: row.task_endtime
                }   
                PropertyPersistence.wrapProperty(project.properties, row);
                EnginePersistence.wrapEngine(project.engines, row);
            })



            var returnArr = {
                id: project.id,
                label: project.label,
                creatorId: project.creatorId,
                sorp: project.sorp,
                tasks: Object.keys(project.tasks).map(function(key){
                    return (project.tasks[key])
                }),
                tags: Object.keys(project.tags).map(function(key){
                    return project.tags[key];
                }),
                properties: Object.keys(project.properties).map(function(key){
                    return project.properties[key];
                }),
                engines: Object.keys(project.engines).sort(function(k1, k2){
                    return (k1.id-k2.id < 0);
                }).map(function(key){
                    var engine =  project.engines[key];
                    engine.properties = Object.keys(engine.properties).map(function(propertyKey){
                        return engine.properties[propertyKey];
                    });
                    return engine;

                })
                //todo: engine.
            }
            return returnArr;
        }

        return new Promise(function(resolve, reject){
            dbpool.execute(sql, function(err, rows){
                resolve({
                    err: err,
                    project: wrap(rows)
                });
            });
        })      
    }

    static findProjects(param){
        var userId = param.userId;
        var offset = param.offset;
        var limit = param.limit;

        var queryCount = function(result, conn){
            var sql = `select count(*) as count from project where flag = 0`;

            var condition = (userId != undefined ? `and p.creator_id=${userId}` : '');
            var sql = `select count(*) as count from project p where p.flag=0 ${condition}`;
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


        var queryProjects = function(result, conn){
            var condition = (userId != undefined ? `and p.creator_id=${userId}` : '');
            var sql = `select id from project p where p.flag=0 ${condition} order by id desc limit ${offset},${limit} `;
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

        var queryOtherInfo = function(result, conn){
            var count = result[0][0].count;
            var projectIdArr = result[1].map(function(row){return row.id});
            if(projectIdArr.length === 0){
                return new Promise(function(resolve, reject){
                    resolve({
                        projects: [],
                        count: 0
                    })
                })
            }


            var projectIds = projectIdArr.join(',');
            var startTime = Util.getOutTime('task.start_time');
            var endTime = Util.getOutTime('task.end_time');
            var tagTime = Util.getOutTime('tag.time');
            var sorp = Util.getOutTime('p.sorp ');

            var sql = `select p.id as project_id, p.label as project_label, ${sorp} as project_sorp, 
                p.creator_id as project_creator_id, task.id as task_id,
                task.label as task_label, ${startTime} as task_startTime, ${endTime} as task_endTime,
                tag.id as tag_id, tag.label as tag_label, ${tagTime} as tag_time, tag.week as tag_week
                from project p
                left join task on (p.id = task.project_id and task.flag=0)
                left join tag on (p.id = tag.project_id and tag.flag=0)
                where p.id in (${projectIds})`;

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
                conn.query(sql, function(err, rows) {
                    if (err) {
                        var errmsg = sql + '\n' + err.stack;
                        reject(new Error(errmsg));
                        return;
                    }
                    resolve({
                        projects: wrap(rows),
                        count: count
                    });
                });    
            })
        }

        var transactionArr = [[queryCount, queryProjects], [queryOtherInfo]];
        return new Promise(function(resolve, reject){
            dbpool.transaction(transactionArr, function(err, result){
                if(err){
                    resolve({
                        err: err
                    });    
                }else{
                    resolve({
                        projects: result[0].projects,
                        count: result[0].count
                    });    
                }                
            });            
        });
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
