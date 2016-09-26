'use strict';
var dbpool = require('../db.js');
var ProjectPersistence = require('./project.js');
var TaskPersistence = require('./task.js');
var EnginePersistence = require('./engine.js');

var propertyKeyMapping = require('../config/propertyKey_searchExpress_mapping.js');

var StaticalPersistence = class StaticalPersistence {
	constructor(){
		
	}
    
    static getStaticalData(projectCreator, taskType, searchExpress){
        var wrapProperty = function(rows){
            var engineId = [-1];
            var projectId = [-1];
            var propertyWrapId = [-1];
            rows.map(function(row){
                if(row.engine_id != null && engineId.indexOf(row.engine_id) === -1){
                    engineId.push(row.engine_id);
                }
                if(row.project_id != null && projectId.indexOf(row.project_id) === -1){
                    projectId.push(row.project_id);
                }
                if(row.property_wrap_id != null && propertyWrapId.indexOf(row.property_wrap_id) === -1){
                    propertyWrapId.push(row.property_wrap_id);
                }
            })
            return {
                engineId: engineId,
                projectId: projectId,
                propertyWrapId: propertyWrapId,
            }
        }
        
        var randomSearch = function(result, conn){
            var sqls = [
                `select engine_id, project_id, property_wrap_id 
                 from property 
                 where label like '%${searchExpress}%'
                 or text like '%${searchExpress}%'
                 or value like '%${searchExpress}%' 
                 or dropdown like '%${searchExpress}%'`
            ];   
            var sql = sqls.join(' '); 

            return new Promise(function(resolve, reject){
                conn.query(sql, function(err, rows) {
                    if(err){
                        var errmsg = `${sql} \n ${err.stack}`;
                        reject(new Error(errmsg));   
                    }else{
                        resolve(wrapProperty(rows));    
                    }
                });    
            })
        }





        var search = function(result, conn){
            var hasSearchExpress = result ? true:false;
            
            var sqls = [`select p.id as project_id, p.label as project_label, p.creator_id as project_creator_id,
                t.id as task_id, t.label as task_label, t.template_type as task_templateType,
                e.id as engine_id, 
                pro.id as engine_property_id, pro.key as engine_property_key, pro.text as engine_property_text, 
                pro.label as engine_property_label,

                e.id as engine_id, p.id as project_id, pw.id as property_wrap_id
                
                from project p
                left join task t on t.project_id=p.id 
                    and t.flag=0

                    left join property_wrap pw on pw.task_id = t.id
                    and pw.flag = 0

                left join engine e on e.project_id=p.id 
                    and e.flag=0
                left join property pro on pro.engine_id=e.id 
                    and pro.label like "engine" 
                    and pro.flag=0
                where p.flag=0`];

            var projectCreatorClause = (projectCreator != undefined) ? `and p.creator_id=${projectCreator}`: '';
            sqls.push(projectCreatorClause);

            var taskTypeClause = (taskType != undefined) ? `and t.template_type = ${taskType}`: '';
            sqls.push(taskTypeClause);


            if(hasSearchExpress){ //condition search or random search
                var obj = result[0];

                var engineIdClause = `and e.id in (${obj.engineId.join(',')})`; 
                sqls.push(engineIdClause);

                var projectIdClause = `or p.id in (${obj.projectId.join(',')})`; 
                sqls.push(projectIdClause);

                var propertyWrapClause = `or pw.id in (${obj.propertyWrapId.join(',')})`; 
                sqls.push(propertyWrapClause);
            }
            

            


            var sql = sqls.join(' ');
            console.log(sql);

            var wrap = function(rows){
                if(!rows)
                    return null;

                var projects = {};
                rows.map(function(row){
                    var projectId = row.project_id;
                    var projectLabel = row.project_label;
                    var projectCreator = row.project_creator_id;
                    var taskId = row.task_id;
                    var taskLabel = row.task_label;
                    var taskType = row.task_templateType;
                    var engineId = row.engine_id;
                    var enginePropertyId = row.engine_property_id;
                    var enginePropertyKey = row.engine_property_key;
                    var enginePropertyText = row.engine_property_text;
                    var enginePropertyLabel = row.engine_property_label;

                    var engineId = row.enigne_id;
                    var projectId = row.project_id;
                    var propertyWrapId = row.property_wrap_id;

                    projects[projectId] = projects[projectId] || {
                        id: projectId,
                        label: projectLabel,
                        creatorId: projectCreator,
                        tasks: {}, 
                        engines: {}
                    }

                    if(hasSearchExpress){ //condition search or random search
                        var obj = result[0];

                        if(obj.propertyWrapId.length > 1){
                            projects[projectId].tasks[taskId] = projects[projectId].tasks[taskId] || {
                                id: taskId,
                                label: taskLabel,
                                template: {
                                    type: taskType
                                }
                            }   
                        }                    
                    }
                    
                    projects[projectId].engines[engineId] = projects[projectId].engines[engineId] || {
                        id: engineId,
                        properties: [{
                            id: enginePropertyId,
                            key: enginePropertyKey,
                            text: enginePropertyText,
                            label: enginePropertyLabel
                        }]
                    }
                })



                var returnArr = Object.keys(projects).map(function(key){
                    var project = projects[key];
                    return {
                        id: project.id,
                        label: project.label,
                        creatorId: project.creatorId,
                        tasks: Object.keys(project.tasks).map(function(key){
                            return (project.tasks[key])
                        }),
                        engines: Object.keys(project.engines).map(function(key){
                            return project.engines[key];
                        })
                    }
                })
                returnArr.reverse(); 



                return returnArr;
            }

            return new Promise(function(resolve, reject){
                conn.query(sql, function(err, rows) {
                    if(err){
                        reject(err);   
                    }else{
                        resolve(wrap(rows));    
                    }
                });    
            })
        }

/*重量=*&发动机=1.0T*/
/*set @engine='%3.0T%';

select p1.engine_id, p1.project_id, p1.property_wrap_id from property p1

left join property p2 
    on (p1.engine_id=p2.engine_id and p1.engine_id is not null) 
    or (p1.project_id=p2.project_id and p2.project_id is not null)
    or (p1.property_wrap_id=p2.property_wrap_id and p2.property_wrap_id is not null)

where 1=1
    and p1.label like '%Mass Target%' 
    and p2.label like '%engine%'
    and (p2.text like @engine or p2.value like @engine or p2.dropdown like @engine)
;
*/
        var conditionSearch = function(result, conn){
            var clauses = [`select p0.engine_id as engine_id, 
                p0.project_id as project_id, 
                p0.property_wrap_id as property_wrap_id
                from property p0`];

            var conditions = searchExpress.split('&').map(function(condition){
                var key = condition.split('=')[0].trim();
                var value = condition.split('=')[1].trim();
                return {
                    key: key,
                    value: value
                }
            })

            var joinClauses = [];
            var whereClauses = [`where 1=1`];

            conditions.map(function(condition, index){
                var keys = propertyKeyMapping[condition.key];
                var keyClause = keys.map(function(k){
                    return `'${k}'`;
                }).join(',');

                var value = condition.value;

                if(index > 0){
                    joinClauses.push(`left join property p${index}
                        on (p${index-1}.engine_id=p${index}.engine_id and p${index}.engine_id is not null) 
                        or (p${index-1}.project_id=p${index}.project_id and p${index}.project_id is not null)
                        or (p${index-1}.property_wrap_id=p${index}.property_wrap_id and p${index}.property_wrap_id is not null) `)    
                }

                whereClauses.push(`and p${index}.key in (${keyClause})`);
                if(value !='*'){
                    whereClauses.push(`and (p${index}.text like '%${value}%' 
                        or p${index}.value like '%${value}%'
                        or p${index}.dropdown like '%${value}%')`);
                }
            })

            var sql = clauses.concat(joinClauses)
                .concat(whereClauses)
                .join(' ');

            console.log(sql);
            return new Promise(function(resolve, reject){
                conn.query(sql, function(err, rows) {
                    if (err) {
                        var errmsg = sql + '\n' + err.stack;
                        reject(new Error(errmsg));
                        return;
                    }
                    resolve(wrapProperty(rows));
                });    
            })
        }

        var transactionArr;
        if(!searchExpress){
            transactionArr = [[search]];
        }else if(searchExpress.indexOf('=') != -1){
            transactionArr = [[conditionSearch], [search]];
        }else{
            transactionArr = [[randomSearch], [search]];
        }
        return new Promise(function(resolve, reject){
            dbpool.transaction(transactionArr, function(err, result){
                resolve({
                    err: err,
                    rows: result ? result[0]: result,
                });    
            });            
        });        
    }

    static findStaticalProjectById(id){
        return ProjectPersistence.findProjectById(id);
    }
    
    static findStaticalTaskById(id){
        return TaskPersistence.findById(id);
    }
    
    static findStaticalEngineById(id){
        return EnginePersistence.findEngineById(id);
    }



}

module.exports = StaticalPersistence;

