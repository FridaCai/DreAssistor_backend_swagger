'use strict';
var dbpool = require('../db.js');
var Project  = require('../model/project.js');
var Util = require('../util.js');

var PropertyPersistence = class PropertyPersistence {
	constructor(){
		
	}

/*	
param:
	[{
		properties: [{dropdown, text, value, key...}, {}, {}],
		foreignObj: {key: project_id, value: projectId}
	}, {
		properties: [{dropdown, text, value, key...}, {}, {}],
		foreignObj: {key: engine_id, value: engineId}
	}]
*/
	static deleteByProjectId(conn, id){
		var condition = [
			{
				key: 'project_id',
				value: id
			}
		];
		return PropertyPersistence.delete(conn, condition);
	}

	static deleteByIds(conn, ids){
		var condition = ids.map(function(id){
			return {
				key: 'id',
				value: id
			}
		});
		return PropertyPersistence.delete(conn, condition);
	}

	static deleteByEngineIds(conn, ids){
		var condition = ids.map(function(id){
			return {
				key: 'engine_id',
				value: id
			}
		});
		return PropertyPersistence.delete(conn, condition)
	}
	static deleteByWrapIds(conn, ids){
		var condition = ids.map(function(id){
			return {
				key: 'property_wrap_id',
				value: id
			}
		});
		return PropertyPersistence.delete(conn, condition);
	}

	static delete(conn, conditions){
		var ids = ['NULL'];
		var projectIds = ['NULL'];
		var engineIds = ['NULL'];
		var propertyWrapIds = ['NULL'];

		conditions.map(function(condition){
			var key = condition.key;
			var value = condition.value;

			if(key === 'id'){
				ids.push(value);
			}
			if(key === 'project_id'){
				projectIds.push(value);
			}
			if(key === 'engine_id'){
				engineIds.push(value);	
			}
			if(key === 'property_wrap_id'){
				propertyWrapIds.push(value);
			}
		})

		var sql = `update property p
			left join curve c on p.id = c.property_id
			left join image i on p.id = i.property_id
			left join attachment a on p.id = a.property_id
			set p.flag=1, c.flag=1, i.flag=1, a.flag=1
			where p.id in (${ids.join(',')}) 
			or p.project_id in (${projectIds.join(',')})
			or p.engine_id in (${engineIds.join(',')})
			or p.property_wrap_id in (${propertyWrapIds.join(',')})`;

        return new Promise(function(resolve, reject){
            conn.query(sql, function(err, result) {
                if (err) {
                    reject(sql + '\n' + new Error(err.stack));
                    return;
                }
                resolve(result);
            })    
        })
	}

	static insertProperty(conn, param){
		var propertyClauseArr = [];

		param.map(function(p){
			var properties = p.properties;
			var foreignObj = p.foreignObj;
			properties.map(function(property){
	            //undefined; null; 0; ''
	            var key = `"${property.key}"`;
	            var label = (property.label === undefined) ? 'NULL': `"${property.label}"`;
	            var text = (property.text === undefined) ? 'NULL': `"${property.text}"`;
	            var value = (property.value === undefined) ? 'NULL': `${property.value}`;
	            var dropdown = (property.dropdown === undefined) ? 'NULL': `"${property.dropdown}"`; 
	            var refKey = (property.refKey === undefined) ? 'NULL': `"${property.refKey}"`;

	            var curve = (property.curve === undefined) ? 'NULL': 0;
	            var attachment = (property.attachment === undefined) ? 'NULL': 0;
	            var image = (property.image === undefined) ? 'NULL': 0;

	            var status = (property.status === undefined) ? 'NULL': `${property.status}`;
	            var engine_id = (foreignObj.key === 'engine_id' ? foreignObj.value: "NULL");
	            var project_id = (foreignObj.key === 'project_id' ? foreignObj.value: "NULL");
	            var property_wrap_id = (foreignObj.key === 'property_wrap_id' ? foreignObj.value: "NULL");

				propertyClauseArr.push(
					`(
		                ${key}, ${label}, ${text}, 
		                ${value}, ${dropdown}, ${refKey}, 
		                ${curve}, ${attachment}, ${image},
		                ${status}, ${engine_id}, ${project_id}, 
						${property_wrap_id}
	            	)`
				);
	            
	        })
		})

		var propertyClause = propertyClauseArr.join(',');

		var sql = `insert into property(
			\`key\`, label, text,
			value, dropdown, ref_key,
			curve, attachment, image, 
			status, engine_id, project_id, 
			property_wrap_id
        ) values ${propertyClause}`;

        return new Promise(function(resolve, reject){
            conn.query(sql, function(err, result) {
                if (err) {
                    reject(sql + '\n' + new Error(err.stack));
                    return;
                }
                resolve(result);
            });
        })
    }
}

module.exports = PropertyPersistence;