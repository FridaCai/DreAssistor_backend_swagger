'use strict';
var dbpool = require('../db.js');
var Project  = require('../model/project.js');
var Util = require('../util.js');

var PropertyPersistence = class PropertyPersistence {
	constructor(){
		
	}

	static wrapProperty(properties, row, prefix){
		prefix = prefix || '';

		var get = function(key){
			return row[`${prefix}${key}`];
		}

		var propertyId = get('property_id');
		var propertyLabel = get('property_label');
		var propertyKey = get('property_key');
		var propertyDropdown = get('property_dropdown');
		var propertyText = get('property_text');
		var propertyValue = get('property_value');
		var propertyRefkey = get('property_ref_key');
		var propertyStatus = get('property_status');
		var propertyCurve = get('property_curve');
		var propertyAttachment = get('property_attachment');
		var propertyImaget = get('property_image');

		properties = properties || {};
        properties[propertyId] = properties[propertyId] || {
            id: propertyId,
            key: propertyKey,
            label: propertyLabel,
        };

        
        if(propertyDropdown != undefined){ //todo. correct???
            properties[propertyId].dropdown = propertyDropdown;
        }
        if(propertyText != undefined){
            properties[propertyId].text = propertyText;
        }
        if(propertyValue != undefined){
            properties[propertyId].value = parseFloat(propertyValue);   
        }
        if(propertyRefkey != undefined){
            properties[propertyId].ref_key = propertyRefkey;   
        }
        if(propertyStatus != undefined){
            properties[propertyId].status = propertyStatus;   
        }
        if(propertyCurve != undefined){
            properties[propertyId].curve = propertyCurve;   
        }
        if(propertyAttachment != undefined){
            properties[propertyId].attachment = propertyAttachment;   
        }
        if(propertyImaget != undefined){
            properties[propertyId].image = propertyImaget;   
        }
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
		return PropertyPersistence.delete(conn, condition);
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
                    var errmsg = sql + '\n' + err.stack;
                    reject(new Error(errmsg));
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
                    var errmsg = sql + '\n' + err.stack;
                    reject(new Error(errmsg));
                    return;
                }
                resolve(result);
            });
        })
    }

    static update(conn, conditions, params){
    	var sqls = [];
		var loop = conditions.length;
		for(var i=0; i<loop; i++){
			var param = params[i];
			var label = (param.label == undefined ? 'NULL': `"${param.label}"`);
			var text = (param.text == undefined ? 'NULL': `"${param.text}"`);
			var value = (param.value == undefined ? 'NULL': param.value);
			var dropdown = (param.dropdown == undefined ? 'NULL': `"${param.dropdown}"`);
			var curve = (param.curve == undefined ? 'NULL': 0);
			var image = (param.image == undefined ? 'NULL': 0);
			var attachment = (param.attachment == undefined ? 'NULL': 0);
			var status = (param.status == undefined ? 'NULL': param.status);


			//if use SQL clause: replace or update on duplicate key, what about the id? it will be guid from client rather than auto-generated id.
		
			var condition = conditions[i];
			var id = 'NULL';
			var projectId = 'NULL';
			var engineId = 'NULL';
			var propertyWrapId = 'NULL';

			switch(condition.key){
				case 'id':
					id = condition.value;
					break;
				case 'project_id':
					projectId = condition.value;
					break;
				case 'engine_id':
					engineId = condition.value;
					break;
				case 'property_wrap_id':
					propertyWrapId = condition.value;
					break;
			}

			sqls.push(`update property p
		    	set 
		    	label = ${label},
		    	\`text\` = ${text}, 
		    	\`value\` = ${value}, 
		    	dropdown = ${dropdown}, 
		    	curve = ${curve}, 
		    	attachment = ${attachment},
		    	image = ${image}, 
		    	status = ${status} 
		    	where p.id = ${id}
					or p.project_id=${projectId}
					or p.engine_id=${engineId}
					or p.property_wrap_id=${propertyWrapId}`);
		}

		var sql = sqls.join(';');
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
       //todo: update curve , attachment, image, more component like time... refer to front end code.
    }
}

module.exports = PropertyPersistence;