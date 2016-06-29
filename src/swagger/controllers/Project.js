'use strict';

var url = require('url');


var Project = require('./ProjectService');


module.exports.projectsGET = function projectsGET (req, res, next) {
  Project.projectsGET(req.swagger.params, res, next);
};

module.exports.projectsPOST = function projectsPOST (req, res, next) {
  Project.projectsPOST(req.swagger.params, res, next);
};

module.exports.projectsProjectIdMobileYearIdDELETE = function projectsProjectIdMobileYearIdDELETE (req, res, next) {
  Project.projectsProjectIdMobileYearIdDELETE(req.swagger.params, res, next);
};

module.exports.projectsProjectIdMobileYearIdGET = function projectsProjectIdMobileYearIdGET (req, res, next) {
  Project.projectsProjectIdMobileYearIdGET(req.swagger.params, res, next);
};
