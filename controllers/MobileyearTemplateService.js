'use strict';

var dbpool = require('../db.js');

exports.mobileyeartemplatesGET = function(args, res, next) {
  var mobileyeartemplates = [];
  var sql = 'select * from template_mobileyears';
  dbpool.execute(sql, function(err, rows){
    if(err){
      console.log(err);
      res.end();
    }

    rows.map(function(row){
      mobileyeartemplates.push({
        id: row.id,
        label: row.label,
      });
    })
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(mobileyeartemplates || [], null, 2));
  });
}

