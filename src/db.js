var mysql = require('mysql');
var logger = require('./logger.js').logger('normal');
var pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'mapi1111111111!',
    database: 'dreassistor',
    port: 3306
});

exports.execute = function(sql, callback){
    pool.getConnection(function(err, conn) {
        if(err) {
            callback(err);
            return;
        }
        	
        conn.query(sql, function(err,rows){
            callback(err, rows);
        });
        conn.release();  
    })
}

//todo: move to util.
var getUnixTime = function(time){
    var time = Math.round(time/1000);
    return `FROM_UNIXTIME(${time})`;
}
exports.batch2 = function(param, callback){
    return new Promise(function(resolve, reject){
        var projectId = param.projectId;
        var task = param.task;
        var label = task.label;
        var startTime = task.startTime;
        var endTime = task.endTime;
        var desc = task.desc;
        var priority = task.priority;
        var exp = task.exp;
        var startWeek = task.startWeek;
        var endWeek = task.endWeek;
        var templateType = task.template.type;

        var sql = `insert into task(label, start_time, end_time, 
            \`desc\`, priority, exp, 
            start_week, end_week, template_type, 
            project_id) 
            values (
                "${label}", ${getUnixTime(startTime)}, ${getUnixTime(endTime)},
                "${desc}", ${priority}, "${exp}",
                ${startWeek}, ${endWeek}, ${templateType},
                ${projectId}
            )`;
        var insertPropertyWrapParam = function(conn, sheetNames, taskId){
            return new Promise(function(resolve, reject){
                if(!sheetNames || sheetNames.length == 0)
                    resolve();



                var clause = sheetNames.map(function(sheetName){
                    return `("${sheetName}", ${taskId})`
                }).join(',');

                var sql = `insert into property_wrap(label, task_id) values ${clause}`;
                conn.query(sql, function(err, result) {
                    if (err) {
                        reject(new Error(err.stack));
                        return;
                    }
                    var insertId = result.insertId;
                    var affectedRows = result.affectedRows;

                    resolve({
                        insertId: insertId,
                        affectedRows: affectedRows,
                    });
                });    
            })
        }

        var insertProperties = function(conn, sheets, propertyWrapParam){
            return new Promise(function(resolve, reject){
                if(!propertyWrapParam)
                    resolve();

                var firstWrapParamId = propertyWrapParam.insertId;


                var propertyClause = sheets.map(function(sheet, index){
                    var propertyWrapId = firstWrapParamId + index;

                    return sheet.map(function(property){
                        //undefined; null; 0; ''
                        var dropdownId = (property.dropdownId == undefined) ? 'NULL': property.dropdownId; 
                        var text = (property.text == undefined) ? 'NULL': `"${property.text}"`;
                        var value = (property.value == undefined) ? 'NULL': `"${property.value}"`;
                        var refKey = (property.refKey == undefined) ? 'NULL': `"${property.refKey}"`;
                        var status = (property.status == undefined) ? 'NULL': `${property.status}`;
                        var label = (property.label == undefined) ? 'NULL': `"${property.label}"`;
                        var key = `"${property.key}"`;
                        return `(
                            ${dropdownId}, ${text}, ${value}, 
                            ${refKey}, ${status}, ${label}, 
                            ${key}, ${propertyWrapId}
                        )`;
                    }).join(',')
                    
                }).join(',');
                




                var sql = `insert into property(
                    dropdown, text, value, 
                    ref_key, status, label,
                    \`key\`, property_wrap_id
                ) values ${propertyClause}`;
                
                conn.query(sql, function(err, result) {
                    if (err) {
                        reject(new Error(err.stack));
                        return;
                    }
                    resolve();
                });
                  

                    


                
            })
        }

        pool.getConnection(function(err, conn) {
            if(err) {
                callback(err);
                return;
            }

            conn.beginTransaction(function(err) {
                if(err) {
                    callback(err);
                    return;
                }
                conn.query(sql, function(err, result) {       
                    if (err) {
                      conn.rollback(function(err){
                        err && logger.error(err);
                      });
                      callback(err);
                      return;
                    }

                    var taskId = result.insertId;
                    var sheetNames = task.template.sheetNames;
                    var sheets = task.template.sheets;

                    insertPropertyWrapParam(conn, sheetNames, taskId).then(function(propertyWrapParam){
                        insertProperties(conn, sheets, propertyWrapParam).then(function(){
                            conn.commit(function(err) {
                                if (err) {
                                  throw err;
                                }
                                callback();
                            });
                        }, function(err){
                            throw err;
                        })
                    }, function(err){
                        throw err;
                    }).catch(function(err){
                        conn.rollback(function(err){
                            err && logger.error(err);
                        });
                        callback(err);
                        return;
                    });

                });
            });
            conn.release();
        });
    })

}

/*
    action = [
        [function], 
        [function, function], 
        [function]
    ]
*/
exports.transaction = function(actions, callback){
    var loop = actions.length;
    var cur = 0;
    
    pool.getConnection(function(err, conn) {
        if(err) {
            callback(err);
            return;
        }

        conn.beginTransaction(function(err) {
            if(err) {
                callback(err);
                return;
            }

            var recursive = function(index, param){
                if(index === loop){
                    return Promise.resolve();
                }
                
                
                
                return Promise.all(
                    actions[index].map((function(f){
                        return f.call(this, param, conn);
                    }).bind(this))
                ).then(function(result){
                    return recursive(++index, result);
                }, function(e){
                    throw e;
                }).catch(function(e){
                    return Promise.reject(e);
                })
            }

            recursive(cur, null).then(function(){
                conn.commit(function(err) {
                    if (err) {
                      throw err;
                    }
                    callback();
                });
            }, function(e){
                throw e;
            }).catch(function(e){
                if (e) {
                  conn.rollback(function(err){
                    err && logger.err(err);
                  });
                  callback(e);
                  return;
                }
            });    
      
        });
        conn.release();
    });
}



exports.batch_deprecated = function(param, callback){
    pool.getConnection(function(err, conn) {
        if(err) {
            callback(err);
            return;
        }

        conn.beginTransaction(function(err) {
            if(err) {
                callback(err);
                return;
            }

            var sql = `insert into project(creator_id, sorp, label) 
                values (${param.creatorId}, ${getUnixTime(param.sorp)}, "${param.label}")`;
            conn.query(sql, function(err, result) {       
                if (err) {
                  conn.rollback(function(err){
                    err && logger.error(err);
                  });
                  callback(err);
                  return;
                }

                var projectId = result.insertId;
                Promise.all([
                    insertTags(conn, param.tags, projectId), 
                    insertTasks(conn, param.tasks, projectId),
                    insertProperties(conn, param.properties, projectId),
                    insertEngines(conn, param.engines, projectId)
                ]).then(function(){
                    conn.commit(function(err) {
                        if (err) {
                          throw err;
                        }
                        callback();
                    });
                }, function(err){
                    throw err;
                }).catch(function(err){
                    conn.rollback(function(err){
                        err && logger.error(err);
                    });
                    callback(err);
                    return;
                });

            });
        });
        conn.release();
    });
}

  