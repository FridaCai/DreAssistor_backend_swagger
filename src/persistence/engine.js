'use strict';
var dbpool = require('../db.js');
var PropertyPersistence = require('./property.js');

var EnginePersistence = class EnginePersistence {
	constructor(){
		
	}

	static insertEngine(conn, projectId, engines){
		if(engines.length === 0){
			return Promise.resolve({
				affectedRows: []
			});
		}

		var engineClause = engines.map(function(engine){
            return `(
                ${projectId}
            )`; 
        }).join(',');

        var sql = `insert into engine(project_id) values ${engineClause}`;

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


	static insertProperties(result, conn, engines){
		var affectedRows = result[0].affectedRows;
        if(affectedRows.length === 0)
            return Promise.resolve();

        var insertId = result[0].insertId;
        var conditions = [];
        for(var i=0; i<affectedRows; i++){
            var engineId = insertId + i;
            var properties = engines[i].properties;

            conditions.push({
                properties: properties,
                foreignObj: {
                    key: 'engine_id',
                    value: engineId
                }
            })
       }
       return PropertyPersistence.insertProperty(conn, conditions);   
	}


	static assembleUpdateHandlers(engines, projectId){
		var select = function(result, conn){
			var sql = `select id from engine where project_id=${projectId} and flag=0` ;
			return new Promise(function(resolve, reject){
                conn.query(sql, function(err, result) {
                    if (err) {
                        var errmsg = sql + '\n' + err.stack;
                        reject(new Error(errmsg));
                        return;
                    }

                    var oldIds = result.map(function(p){
		        		return p.id;
		        	})

                    resolve({
                    	updateEngineParam: (function(){
			        		var params = [];
				            engines.map(function(engine){
				                if(oldIds.indexOf(engine.id)!=-1){
				                    params.push(engine);
				                }
				            })
				            return params;
			        	})(),
			        	insertEngineParam: (function(){
			        		var params = [];
			                engines.map(function(engine){
			                    if(oldIds.indexOf(engine.id)==-1){
			                        params.push(engine);
			                    }
			                })
			                return params;
			        	})(),
			        	deleteEngineParam: (function(){
							var params = [];
			                oldIds.map(function(oldId){
			                    var findEngine = engines.find(function(engine){
			                        return engine.id === oldId;
			                    })
			                    if(!findEngine){
			                        params.push(oldId);
			                    }
			                });
			                return params;
			        	})()
                    });
                });    
            })
		}

		var deleteEngine = function(result, conn){ 
			var params = result[0].deleteEngineParam;
			if(params.length === 0)
				return Promise.resolve();
			
			var idClause = params.join(',');

			var sql = `update engine
				set engine.flag=1
				where engine.id in (${idClause})`;

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
		var deleteProperties = function(result, conn){
			var params = result[0].deleteEngineParam;
			if(params.length === 0)
				return Promise.resolve();

			return PropertyPersistence.deleteByEngineIds(conn, params);
		}


		var update = function(result, conn){
			var params = result[0].updateEngineParam;
			if(params.length === 0)
				return Promise.resolve();

			return new Promise(function(resolve, reject){
    			var idClause = params.map(function(engine){
					return engine.id;
				}).join(',');
	            var sql = `update engine set update_time = now() where id in (${idClause})`;

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

		var updateProperties = function(result, conn){
			var params = result[0].updateEngineParam;

			if(params.length === 0)
				return Promise.resolve();

			var conditions = [];
			var properties = [];
			params.map(function(param){
				param.properties.map(function(property){
					conditions.push({
						key: 'id',
						value: property.id
					});
					properties.push(property);
				})
			})
			return PropertyPersistence.update(conn, conditions, properties);
		}
		var insertEngine = function(result, conn){
			var params = result[0].insertEngineParam;
			return EnginePersistence.insertEngine(conn, projectId, params);
		}
		var insertEngineProperties = function(result, conn){
			return EnginePersistence.insertProperties(result, conn, engines);
		}


		return [
			[select], 
			[
				insertEngine,
				deleteEngine, 
				deleteProperties, 
				update, 
				updateProperties
			],
			[insertEngineProperties]
		];
	}
}

module.exports = EnginePersistence;

