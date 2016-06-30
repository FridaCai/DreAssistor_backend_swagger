var app = require('express')();
var http = require('http');
var swagger = require('./src/swagger/index.js');
var logger = require('./src/logger.js');

var serverPort = 8080;


var preBootActions = [
	swagger.execute(app),
	logger.init(app)
]

Promise.all(preBootActions).then(function(){
	http.createServer(app).listen(serverPort, function () {
    	console.log('Your server is listening on port %d (http://localhost:%d)', serverPort, serverPort);
  });
});
