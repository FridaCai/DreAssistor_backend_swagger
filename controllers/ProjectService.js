'use strict';

exports.projectsGET = function(args, res, next) {
  /**
   * parameters expected in the args:
  **/
    var examples = {};
  examples['application/json'] = [ {
  "createTime" : 1.3579000000000001069366817318950779736042022705078125,
  "mobileYearId" : "aeiou",
  "creatorId" : "aeiou",
  "projectId" : "aeiou"
} ];
  if(Object.keys(examples).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
  }
  else {
    res.end();
  }
  
}

exports.projectsPOST = function(args, res, next) {
  /**
   * parameters expected in the args:
  * project (NewProject)
  **/
    var examples = {};
  examples['application/json'] = {
  "createTime" : 1.3579000000000001069366817318950779736042022705078125,
  "mobileYearId" : "aeiou",
  "creatorId" : "aeiou",
  "projectId" : "aeiou"
};
  if(Object.keys(examples).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
  }
  else {
    res.end();
  }
  
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
  /**
   * parameters expected in the args:
  * projectId (String)
  * mobileYearId (String)
  **/
    var examples = {};
  examples['application/json'] = {
  "createTime" : 1.3579000000000001069366817318950779736042022705078125,
  "mobileYearId" : "aeiou",
  "creatorId" : "aeiou",
  "projectId" : "aeiou"
};
  if(Object.keys(examples).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
  }
  else {
    res.end();
  }
  
}

