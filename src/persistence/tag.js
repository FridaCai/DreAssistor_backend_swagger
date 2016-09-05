'use strict';
var dbpool = require('../db.js');

var TagPersistence = class TagPersistence {
	constructor(){
		
	}
	static delete(conn, condition){
		var id = (condition.key === 'id') ? condition.value:'NULL';
		var projectId = (condition.key === 'project_id') ? condition.value:'NULL';

		var sql = `update tag
			set tag.flag=1
			where tag.id=${id} 
			or tag.project_id=${projectId}`;

        return new Promise(function(resolve, reject){
            conn.query(sql, function(err, result) {
                if (err) {
                    reject(sql + '\n' + new Error(err.stack));
                }
                resolve(result);
            })    
        })
	}

	static deleteByProjectId(conn, id){
		var condition = {
			key: 'project_id',
			value: id
		}
		return TagPersistence.delete(conn, condition);
	}
}

module.exports = TagPersistence;