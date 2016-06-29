'use strict';

var dbpool = require('../../db.js');
exports.projectsGET = function(args, res, next) {
  var projects = [];
  var sql = 'select * from projects';
  dbpool.execute(sql, function(err, rows){
    if(err){
      console.log(err);
      res.end();
    }

    rows.map(function(row){
      projects.push({
        projectId: row.projectId,
        createTime: row.createTime,
        mobileYearId: row.mobileYearId,
        creatorId: row.creatorId,
      });
    })
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(projects || [], null, 2));
  });
}




var convertDateToUnixTime = function(d) {
  var unixTime = Date.parse(d);
  unixTime = unixTime || undefined;
  return unixTime;
}

var convertUnixTimeToDate = function(unix_timestamp) {
      var d = new Date(unix_timestamp);
      return d.toLocaleDateString() + " " + d.toLocaleTimeString();
}






exports.projectsPOST = function(args, res, next) {
  /**
   * parameters expected in the args:
  * project (NewProject)
  **/
  var param = args.project.value;

  var projectId = param.projectId;
  var mobileYearId = param.mobileYearId;
  var createTime = convertDateToUnixTime(new Date());
  var creatorId = '0'; //todo: creatorId should be login userid.


  
  var sql = `insert into projects(projectId, createTime, mobileYearId, creatorId) 
    values ("${projectId}", "${createTime}", "${mobileYearId}", "${creatorId}")`;


  var project = {};
  dbpool.execute(sql, function(err, rows){
    if(err){
      console.log(err);
      res.end();
    }

    console.log(rows);

    project = {
      projectId: projectId,
      mobileYearId: mobileYearId,
      createTime: createTime,
      creatorId: creatorId,
    }

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(project || {}, null, 2));
  });
}





exports.projectsProjectIdMobileYearIdDELETE = function(args, res, next) {
  /**
   * parameters expected in the args:
  * projectId (String)
  * mobileYearId (String)
  **/
  // no response value expected for this operation
  res.end();
}

exports.projectsProjectIdMobileYearIdGET = function(args, res, next) {
  res.end();
}

