'use strict';

var ProjectTemplate = require('./ProjectTemplateService');
module.exports.projecttemplatesGET = function projecttemplatesGET (req, res, next) {
  ProjectTemplate.projecttemplatesGET(req.swagger.params, res, next);
};
