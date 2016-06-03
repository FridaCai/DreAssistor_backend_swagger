'use strict';

var url = require('url');


var MobileyearTemplate = require('./MobileyearTemplateService');


module.exports.mobileyeartemplatesGET = function mobileyeartemplatesGET (req, res, next) {
  MobileyearTemplate.mobileyeartemplatesGET(req.swagger.params, res, next);
};
