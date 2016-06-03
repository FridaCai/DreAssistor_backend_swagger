var mysql = require('mysql');

var pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'mapi1111111111!',
    database: 'dreassistor',
    port: 3306
});

exports.execute = function(sql, callback){
  pool.getConnection(function(err, conn) {
    if(err) 
    	console.log('POOL ==> ' + err);
    
    conn.query(sql, function(err,rows){
        callback(err, rows);
    });
    conn.release();
  })
}

  