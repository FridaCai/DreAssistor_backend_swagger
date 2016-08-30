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
            projectId) 
            values (
                "${label}", FROM_UNIXTIME(${startTime}), FROM_UNIXTIME(${endTime}),
                "${desc}", ${priority}, "${exp}",
                ${startWeek}, ${endWeek}, ${templateType},
                ${projectId}
            )`;
        var insertPropertyWrapParam = function(conn, sheetNames, taskId){
            return new Promise(function(resolve, reject){
                var clause = sheetNames.map(function(sheetName){
                    return `("${sheetName}", ${taskId})`
                }).join(',');

                var sql = `insert into property_wrap(label, taskId) values ${clause}`;
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
            debugger;
            return new Promise(function(resolve, reject){
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
                        return `(
                            ${dropdownId}, ${text}, ${value}, 
                            ${refKey}, ${status}, ${label}, 
                            ${propertyWrapId}
                        )`;
                    }).join(',')
                    
                }).join(',');
                




                var sql = `insert into property(
                    dropdown_id, text, value, 
                    ref_key, status, label, 
                    property_wrap_id
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
//todo: refactor.
exports.batch = function(param, callback){
    var insertEngines = function(conn, engines, projectId){
        //insert engine, set engine.projectId.
        //get engineId.
        //insert propery table, set property.engineId
        return new Promise(function(resolve, reject){
            var engineClause = engines.map(function(engine){
                return `(
                    ${projectId}
                )`; 
            }).join(',');

            var sql = `insert into engine(projectId) values ${engineClause}`;
            conn.query(sql, function(err, result) {
                if (err) {
                    reject(new Error(err.stack));
                    return;
                }

                var affectedRows = result.affectedRows;
                var insertId = result.insertId;

                var propertyClauseArr = [];
                for(var i=0; i<affectedRows; i++){
                    var engineId = insertId + i;
                    var property = engines[i];

                    var dropdownId = (property.dropdownId == undefined) ? 'NULL': property.dropdownId; 
                    var text = (property.text == undefined) ? 'NULL': `"${property.text}"`;
                    var value = (property.value == undefined) ? 'NULL': `"${property.value}"`;
                    var refKey = (property.refKey == undefined) ? 'NULL': `"${property.refKey}"`;
                    var status = (property.status == undefined) ? 'NULL': `${property.status}`;
                    var label = (property.label == undefined) ? 'NULL': `"${property.label}"`;


                    propertyClauseArr.push(
                        `(
                            ${dropdownId}, ${text}, ${value}, 
                            ${refKey}, ${status}, ${label}, 
                            ${engineId}
                        )`
                    )
                }

                var propertyClause = propertyClauseArr.join(",");
                var sql = `insert into property(
                    dropdown_id, text, value, 
                    ref_key, status, label, 
                    engineId
                ) values ${propertyClause}`;


                conn.query(sql, function(err, result) {
                    if (err) {
                        reject(new Error(err.stack));
                        return;
                    }
                    resolve();
                });
            });
        })
    }
    var insertProperties = function(conn, properties, projectId){
        return new Promise(function(resolve, reject){
            var propertyClause = properties.map(function(property){
                //undefined; null; 0; ''
                var dropdownId = (property.dropdownId == undefined) ? 'NULL': property.dropdownId; 
                var text = (property.text == undefined) ? 'NULL': `"${property.text}"`;
                var value = (property.value == undefined) ? 'NULL': `"${property.value}"`;
                var refKey = (property.refKey == undefined) ? 'NULL': `"${property.refKey}"`;
                var status = (property.status == undefined) ? 'NULL': `${property.status}`;
                var label = (property.label == undefined) ? 'NULL': `"${property.label}"`;

                return `(
                    ${dropdownId}, ${text}, ${value}, 
                    ${refKey}, ${status}, ${label}, 
                    ${projectId}
                )`;

            }).join(',');
            
            var sql = `insert into property(
                dropdown_id, text, value, 
                ref_key, status, label, 
                projectId
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
    var insertTasks = function(conn, tasks, projectId){
        return new Promise(function(resolve, reject){
            var taskClause = tasks.map(function(task){
                var label = task.label;
                var startTime = task.startTime;
                var endTime = task.endTime;
                var desc = task.desc;
                var exp = task.exp;
                var priority = task.priority;
                var startWeek = task.startWeek;
                var endWeek = task.endWeek;
                var templateType = task.template.type;

                return `("${label}", FROM_UNIXTIME(${startTime}), FROM_UNIXTIME(${endTime}), 
                    "${desc}", "${exp}",  ${priority}, 
                    ${startWeek}, ${endWeek}, ${templateType}, 
                    ${projectId})`;
            }).join(',');
            
            var sql = `insert into task(
                label, start_time, end_time, 
                \`desc\`, exp, priority, 
                start_week, end_week, template_type, 
                projectId
            ) values ${taskClause}`;

            conn.query(sql, function(err, result) {
                if (err) {
                    reject(new Error(err.stack));
                    return;
                }
                resolve();
            });
        })
    }
    var insertTags = function(conn, tags, projectId){
        return new Promise(function(resolve, reject){
            var tagClause = tags.map(function(tag){
                var label = tag.label;
                var time = tag.time;
                var week = tag.week;
                return `("${label}", FROM_UNIXTIME(${time}), ${week}, ${projectId})`;
            }).join(',');
            
            var sql = `insert into tag(label, time, week, projectId) values ${tagClause}`;
            
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

            var sql = `insert into project(creatorId, sorp) values ("${param.creatorId}", FROM_UNIXTIME(${param.sorp})`;
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
                    debugger;
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

  