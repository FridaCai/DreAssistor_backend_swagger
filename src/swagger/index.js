'use strict';
var swaggerTools = require('swagger-tools');
var jsyaml = require('js-yaml');
var fs = require('fs');

module.exports = {
  execute: function(app){
    var options = {
      controllers: './src/swagger/controllers',
      useStubs: process.env.NODE_ENV === 'development' ? true : false // Conditionally turn on stubs (mock mode)
    };

    var spec = fs.readFileSync('./src/swagger/swagger.yaml', 'utf8');
    var swaggerDoc = jsyaml.safeLoad(spec);
    
    return new Promise(function(resolve, reject){
      swaggerTools.initializeMiddleware(swaggerDoc, function (middleware) {
        app.use(middleware.swaggerMetadata());
        app.use(middleware.swaggerValidator());
        app.use(middleware.swaggerRouter(options));
        resolve();
      });
    })
  }
}
  



