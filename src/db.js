var mysql = require('mysql');
var logger = require('./logger.js').logger('normal');
var Util = require('./util.js');

var pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'mapi1111111111!',
    database: 'dreassistor',
    port: 3306,
    multipleStatements: true
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

  