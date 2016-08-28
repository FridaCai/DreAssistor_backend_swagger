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

//todo: refactor.
exports.batch = function(param, callback){
    

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

            var sql = `insert into project(creatorId) values ("${param.creatorId}")`;
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
                    insertTasks(conn, param.tasks, projectId)
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

  