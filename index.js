var app = require('connect')();
var http = require('http');
var swagger = require('./src/swagger/index.js');
var logger = require('./src/logger.js');

var serverPort = 8080;


var startServer = function(){
  http.createServer(app).listen(serverPort, function () {
    console.log('Your server is listening on port %d (http://localhost:%d)', serverPort, serverPort);
  });
}

swagger.execute(app, startServer);
logger.init(app);
