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
                    var errmsg = sql + '\n' + err.stack;
                    reject(new Error(errmsg));
                    return;
                }
                resolve(result);
            })    
        })
	}

	
}

module.exports = TagPersistence;