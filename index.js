'use strict';

var app = require('connect')();
var http = require('http');
var swaggerTools = require('swagger-tools');
var jsyaml = require('js-yaml');
var fs = require('fs');
var serverPort = 8080;

// swaggerRouter configuration
var options = {
  swaggerUi: '/swagger.json',
  controllers: './controllers',
  useStubs: process.env.NODE_ENV === 'development' ? true : false // Conditionally turn on stubs (mock mode)
};

// The Swagger document (require it, build it programmatically, fetch it from a URL, ...)
var spec = fs.readFileSync('./api/swagger.yaml', 'utf8');
var swaggerDoc = jsyaml.safeLoad(spec);

// Initialize the Swagger middleware
swaggerTools.initializeMiddleware(swaggerDoc, function (middleware) {
  // Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
  app.use(middleware.swaggerMetadata());

  // Validate Swagger requests
  app.use(middleware.swaggerValidator());

  // Route validated requests to appropriate controller
  app.use(middleware.swaggerRouter(options));

  // Serve the Swagger documents and Swagger UI
  app.use(middleware.swaggerUi());

  // Start the server
  http.createServer(app).listen(serverPort, function () {
    console.log('Your server is listening on port %d (http://localhost:%d)', serverPort, serverPort);
    console.log('Swagger-ui is available on http://localhost:%d/docs', serverPort);
  });
});








var log4js = require('log4js');
log4js.configure({
  appenders: [
    { type: 'console' },{
      type: 'file', 
      filename: 'logs/access.log', 
      maxLogSize: 4096000, //3m
      backups:4,
      category: 'normal' 
    }
  ],
  replaceConsole: true
});
var logger = log4js.getLogger('normal');
logger.setLevel('INFO');
app.use(log4js.connectLogger(logger, {level:log4js.levels.INFO, format:':method :url'}));

exports.logger=function(name){
  var logger = log4js.getLogger(name);
  //logger.setLevel('INFO');
  return logger;
}