'use strict';
var dbpool = require('../db.js');
var PropertyPersistence = require('./property.js');

var EnginePersistence = class EnginePersistence {
	constructor(){
		
	}
	static delete(conn, condition){
		var ids = (condition.key === 'ids') ? condition.value:'NULL';
		var projectId = (condition.key === 'project_id') ? condition.value:'NULL';

		var idClause = ids.join(',');
		var deleteEngines = function(result, conn){
			var sql = `update engine
				set engine.flag=1
				where engine.id in (${idClause})
				or engine.project_id=${projectId}`;

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
			return PropertyPersistence.deleteByEngineIds()
		}
		var transactionArr = [[deleteEngines], [deleteProperties]]
	}

	static update(result, conn, params){
		/*var updateEngine = function(result, conn){
			var idClause = params.map(function(param){
				return param.id;
			}).join(',');

			var sql = `update engine set update_time = now() where id in ${idsClause};`
			
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
		var updateProperties = function(result, conn){
			var condition = params.map(function(param){
				return {
					key: 'engine_id'
					value: param.id
				}
			})
			return PropertyPersistence.update(conn, condition, params);
		}

		return new Promise(function(resolve, reject){
            dbpool.transaction([
                [updateEngine, updateProperties]
            ], function(err, rows){
                resolve({
                    err: err,
                });
            });
        });*/
		
	}
	static insert(conn, projectId, engines){
		var insertEngine = function(){
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
		var insertProperties = function(result, conn){
			var affectedRows = result[3].affectedRows;
            var insertId = result[3].insertId;

            var enginePropertiesParam = [];

            for(var i=0; i<affectedRows; i++){
                var engineId = insertId + i;
                var properties = engines[i].properties;

                enginePropertiesParam.push({
                    properties: properties,
                    foreignObj: {
                        key: 'engine_id',
                        value: engineId
                    }
                })
	       }
           return PropertyPersistence.insertProperty.call(this, conn, enginePropertiesParam);   
		}

		return new Promise(function(resolve, reject){
            dbpool.transaction([
                [insertEngine], 
                [insertProperties]
            ], function(err, rows){
                resolve({
                    err: err,
                });
            });
        });
	}


	static deleteByProjectId(conn, id){
		var condition = {
			key: 'project_id',
			value: id
		}
		return EnginePersistence.delete(conn, condition);
	}
	static deleteByIds(conn, ids){
		var condition = {
			key: 'id',
			value: ids
		}
		return EnginePersistence.delete(conn, condition);
	}
}

module.exports = EnginePersistence;

