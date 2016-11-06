'use strict';
var dbpool = require('../db.js');
var ProjectPersistence = require('./project.js');
var TaskPersistence = require('./task.js');
var EnginePersistence = require('./engine.js');

var propertyKeyMapping = require('../config/propertyKey_searchExpress_mapping.js');
var Util = require('../util.js');


var StaticalPersistence = class StaticalPersistence {
	constructor(){
		
	}
    
    static getStaticalData(taskType){
        var sqls = [`select p.id as project_id, p.label as project_label, p.creator_id as project_creator_id,
            t.id as task_id, t.label as task_label, t.template_type as task_templateType,
            ${Util.getOutTime('t.start_time')} as task_startTime, ${Util.getOutTime('t.end_time')} as task_endTime, 
            e.id as engine_id, 
            pro.id as engine_property_id, pro.key as engine_property_key, pro.text as engine_property_text, 
            pro.label as engine_property_label,

            pw.id as property_wrap_id
            
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

        var taskTypeClause = (taskType != undefined) ? `and t.template_type = ${taskType}`: '';
        sqls.push(taskTypeClause);
        
        var sql = sqls.join(' ');

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
                var taskStartTime = row.task_startTime;
                var taskEndTime = row.task_endTime;
                var engineId = row.engine_id;
                var enginePropertyId = row.engine_property_id;
                var enginePropertyKey = row.engine_property_key;
                var enginePropertyText = row.engine_property_text;
                var enginePropertyLabel = row.engine_property_label;

                var propertyWrapId = row.property_wrap_id;

                projects[projectId] = projects[projectId] || {
                    id: projectId,
                    label: projectLabel,
                    creatorId: projectCreator,
                    tasks: {}, 
                    engines: {}
                }
           
                projects[projectId].tasks[taskId] = projects[projectId].tasks[taskId] || {
                    id: taskId,
                    label: taskLabel,
                    startTime: taskStartTime,
                    endTime: taskEndTime,
                    template: {
                        type: taskType
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
            dbpool.execute(sql, function(err, rows){
                resolve({
                    err: err,
                    rows: wrap(rows)
                });
            });
        })
    }


    static _conditionSearch(searchExpress){

    }
    static _randomSearch(searchExpress){
        var createHitObj = function(label, hitstring, path){
            return {
                label: label,
                hitstring: hitstring,
                path: path
            }
        }

        var returnResult = {
            engines: [],
            tasks: [],
            projects: [] 
        }

        var searchProperty = function(){
            var wrap = function(rows){
                rows.map(function(row){
                    
                })
            }

            var sqls = [
                `select prop.id as property_id, prop.project_id as property_project_id, prop.engine_id as property_engine_id,
                    prop.property_wrap_id as property_property_wrap_id,
                    
                    prop.label as property_label, prop.text as property_text, prop.value as property_value, prop.dropdown as property_dropdown,
                    proj.label as project_label, t.label as task_label

                from property prop 
                left join engine e on e.id = prop.engine_id
                left join project proj on proj.id = prop.project_id
                left join property_wrap pw on pw.id = prop.property_wrap_id
                    left join task t on t.id = pw.task_id
                    
                where prop.label like concat('%',@searchExpress, '%')
                or prop.text like concat('%',@searchExpress, '%')
                or prop.value like concat('%',@searchExpress, '%')
                or prop.dropdown like concat('%',@searchExpress, '%');
                `
            ];   
            var sql = sqls.join(' '); 

            return new Promise(function(resolve, reject){
                dbpool.singleExecute(conn, sql, function(err, result) {
                    if(err){
                        var errmsg = `${sql} \n ${err.stack}`;
                        reject(new Error(errmsg));   
                    }else{
                        resolve(wrap(result));    
                    }
                });    
            })
        }

        var searchEngine = function(){

        }

        var searchTask = function(){

        }

        var searchProject = function(){

        }


        
    }

    static search(searchExpress){
        var searchExpress = decodeURIComponent(searchExpress);

        if(searchExpress.indexOf('=') != -1){
            this._conditionSearch(searchExpress);
        }else{
            this._randomSearch(searchExpress);
        }
    }

    static findStaticalProjectById(id){
        return ProjectPersistence.findProjectById(id);
    }
    
    static findStaticalTaskById(id){
        return TaskPersistence.findByIds([id]);
    }
    static findStaticalTasksByIds(ids){
        return TaskPersistence.findByIds(ids);
    }
    
    static findStaticalEngineById(id){
        return EnginePersistence.findEngineById(id);
    }
}

module.exports = StaticalPersistence;

