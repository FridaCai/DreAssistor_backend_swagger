'use strict';
var dbpool = require('../db.js');
var ProjectPersistence = require('./project.js');
var TaskPersistence = require('./task.js');
var EnginePersistence = require('./engine.js');

var StaticalPersistence = class StaticalPersistence {
	constructor(){
		
	}
    
    static getStaticalData(){
        var sql = `select p.id as project_id, p.label as project_label, t.id as task_id, 
            t.label as task_label, e.id as engine_id, pro.id as engine_property_id,
            pro.key as engine_property_key, pro.text as engine_property_text, pro.label as engine_property_label
            
            from project p
            left join task t on t.project_id=p.id 
                and t.flag=0
            left join engine e on e.project_id=p.id 
                and e.flag=0
            left join property pro on pro.engine_id=e.id 
                and pro.label like "engine" 
                and pro.flag=0
            where p.flag=0`;

        var wrap = function(rows){
            var projects = {};
            rows.map(function(row){
                var projectId = row.project_id;
                var projectLabel = row.project_label;
                var taskId = row.task_id;
                var taskLabel = row.task_label;
                var engineId = row.engine_id;
                var enginePropertyId = row.engine_property_id;
                var enginePropertyKey = row.engine_property_key;
                var enginePropertyText = row.engine_property_text;
                var enginePropertyLabel = row.engine_property_label;

                projects[projectId] = projects[projectId] || {
                    id: projectId,
                    label: projectLabel,
                    tasks: {}, 
                    engines: {}
                }

                projects[projectId].tasks[taskId] = projects[projectId].tasks[taskId] || {
                    id: taskId,
                    label: taskLabel
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



            return projects;
        }

        return new Promise(function(resolve, reject){
            dbpool.execute(sql, function(err, rows){
                var error = err ? new Error(sql + '\n' + err.stack) : null;
                resolve({
                    err: error,
                    projects: wrap(rows)
                });
            });
        })
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

