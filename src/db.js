var mysql = require('mysql');
var logger = require('./logger.js').logger('normal');
var Util = require('./util.js');

var pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'mapi1111111111!',
    database: 'dreassistor',
    port: 3306,
    multipleStatements: true
});


exports.execute = function(sql, callback){
    logger.debug(`SQL: ${sql}`);
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

exports.singleExecute = function(conn, sql, cb){
    console.debug(`SQL: ${sql}`);
    conn.query(sql, cb);
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
                    return Promise.resolve(param);
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

            recursive(cur, null).then(function(result){
                conn.commit(function(err, rows) {
                    if (err) {
                      throw err;
                    }
                    callback(err, result);
                });
            }, function(e){
                throw e;
            }).catch(function(e){
                if (e) {
                  conn.rollback(function(err){
                    err && logger.error(err.stack);
                  });
                  callback(e);
                  return;
                }
            });    
      
        });
        conn.release();
    });
}

  