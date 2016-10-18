'use strict';
var dbpool = require('../db.js');
var PropertyPersistence = require('./property.js');

var EnginePersistence = class EnginePersistence {
	constructor(){
		
	}


	static wrapEngine(engines, row){
		engines = engines || {};
		engines[row.engine_id] = engines[row.engine_id] || {
            id: row.engine_id,
            properties: {}
        };
        var prefix = 'engine_';
        PropertyPersistence.wrapProperty(engines[row.engine_id].properties, row, prefix);
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
		var affectedRows = result.affectedRows;
        if(affectedRows.length === 0){
        	return Promise.resolve({
				affectedRows: []
			});
        }
            

        var insertId = result.insertId;
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
       return PropertyPersistence.insertProperty(conditions, result, conn);   
	}
	static insertPropertiesCurve(result, conn, engines){
		if(result.affectedRows.length === 0){
			return Promise.resolve({
				affectedRows: []
			});
		}

		var properties = [];
		engines.map(function(engine){
			engine.properties.map(function(property){
				properties.push(property);
			})
		})
		return PropertyPersistence.insertCurve(properties, result, conn);
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
			var properties = [];
			params.map(function(param){
				param.properties.map(function(property){
					properties.push(property);
				})
			})
			return PropertyPersistence.assembleUpdateHandlers(properties, result, conn);
		}
		
		var insertEngine = function(result, conn){
			var params = result[0].insertEngineParam;
			return EnginePersistence.insertEngine(conn, projectId, params);
		}
		var insertEngineProperties = function(result, conn){
			return EnginePersistence.insertProperties(result[0], conn, engines);
		}
		var insertEnginePropertiesCurve = function(result, conn){
			return EnginePersistence.insertPropertiesCurve(result[0], conn, engines);
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
			[insertEngineProperties],
			[insertEnginePropertiesCurve]
		];
	}

	static findEngineById(id){
		var sql = `select p.id as property_id, p.key as propery_key, p.label as property_label,
			p.text as property_text, p.value as property_value, p.dropdown as property_dropdown, 
			p.ref_key as property_ref_key, p.curve as property_curve, p.attachment as property_attachment,
			p.image as property_image, p.status as property_status,
			p.engine_id as engine_id
			from property p 
			where p.engine_id=${id} 
			and p.flag=0`;

		var wrap = function(rows){
			var id = rows[0].engine_id;
			return {
				id: id,
				properties: rows.map(function(row){
					return {
						id: row.property_id,
						dropdown: row.property_dropdown,
						text: row.property_text,
						value: row.property_value,
						status: row.property_status,
						label: row.property_label,
						key: row.propery_key,
						curve: row.property_curve,
						attachment: row.property_attachment,
						image: row.property_image
					}
				})
			}
		}
		return new Promise(function(resolve, reject){
            dbpool.execute(sql, function(err, rows){
                resolve({
                    err: err,
                    engine: wrap(rows)
                });
            });
        })
	}
}

module.exports = EnginePersistence;

