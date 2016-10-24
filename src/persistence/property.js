'use strict';
var dbpool = require('../db.js');
var Project  = require('../model/project.js');
var Util = require('../util.js');
var CurvePersistence = require('./curve.js');
var AttachmentPersistence = require('./attachment.js');
var ImagePersistence = require('./attachment.js');

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
		
		//convert db curve to client;
		var propertyCurve = (function(curve){
			if(curve == undefined){
				return undefined;
			}else if(curve === 0){
				return {};
			}else{
				return {
					id: curve
				}
			}
		})(get('property_curve'));
		



		var propertyAttachment = (function(at){
			if(at == undefined){
				return undefined;
			}else if(at === 0){
				return [];//query more info when user open expander.
			}
		})(get('property_attachment'));


		var propertyImage = (function(img){
			if(img == undefined){
				return undefined;
			}else if(img === 0){
				return [];//query more info when user open expander.
			}
		})(get('property_image'));


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
            properties[propertyId].refKey = propertyRefkey;   
        }
        if(propertyStatus != undefined){
            properties[propertyId].status = propertyStatus ? true: false;   
        }
        if(propertyCurve != undefined){
            properties[propertyId].curve = propertyCurve;   
        }
        if(propertyAttachment != undefined){
            properties[propertyId].attachment = propertyAttachment;   
        }
        if(propertyImage != undefined){
            properties[propertyId].image = propertyImage;   
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


	static insertProperty(conditions, result, conn){
		var propertyClauseArr = [];
		conditions.map(function(condition){
			var properties = condition.properties;
			var foreignObj = condition.foreignObj;
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

	static insertAttachment(properties, result, conn, key){
		var insertPropertyFirstId = result.insertId;
		var index = 0;
		var attachmentParam = [];
		
		properties.map(function(property){
			if(AttachmentPersistence.needToSave(property.attachment)){ 
				var obj = {
					attachment: property.attachment,
				}
				obj[key] = insertPropertyFirstId + index;
				attachmentParam.push(obj);
			}
			index ++;
		})

		if(attachmentParam.length === 0){
    		return Promise.resolve();
    	}
    	return AttachmentPersistence.insert(attachmentParam, conn);
	}

	static insertCurve(properties, result, conn){
		var insertPropertyFirstId = result.insertId;
		var index = 0;
		var curveParam = [];

		
		properties.map(function(property){
			if(CurvePersistence.isDefined(property.curve)){
				curveParam.push({
					curve: property.curve,
					propertyId: insertPropertyFirstId + index
				})
			}
			index ++;
		})

		if(curveParam.length === 0){
    		return Promise.resolve();
    	}

    	return CurvePersistence.insert(curveParam, conn);
	}

	static assembleUpdateHandlers(properties, result, conn){
		var deleteCurve = function(){
			var propertyIds = [];
			properties.map(function(property){
				if(CurvePersistence.isDefined(property.curve)){ //todo: should in Curve data model.
	    			propertyIds.push(property.id);
	    		}
	    	})
	    	if(propertyIds.length === 0)
	    		return Promise.resolve();

	    	return CurvePersistence.delete(propertyIds, conn);
		}

		var insertCurve = function(){
			var curveParam = [];
			properties.map(function(property){
				var propertyId = property.id;	
				if(CurvePersistence.isDefined(property.curve)){ //todo: should in Curve data model.
	    			curveParam.push({
	        			curve: property.curve,
	        			propertyId: propertyId
	        		});
	    		}
			})
	    	if(curveParam.length === 0){
	    		return Promise.resolve();
	    	}
	    	return CurvePersistence.insert(curveParam, conn);
		}

		var update = function(){
			var conditions = [];
			var params = [];
			var update = function(conn, conditions, params){
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

			properties.map(function(property){
				conditions.push({
					key: 'id',
					value: property.id
				})
				params.push(property)
			})
			return update(conn, conditions, params);
		}

		var updateAttachment = function(){
			var condition = [];
			properties.map(function(property){
				property.attachment && property.attachment.map(function(at){
					condition.push({
						propertyId: property.id,
						attachment: at
					});	
				})
				
			})
			return AttachmentPersistence.update(result, conn, condition);
		}

		return Promise.all([
			update(),
			deleteCurve(), 
			insertCurve(), 
			updateAttachment()
		]);
	}
}

module.exports = PropertyPersistence;