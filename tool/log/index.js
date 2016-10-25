/*
# read in log file line by line.
# fatal, error, warn, debug, info, trace.
TRACE
DEBUG
INFO
WARN
ERROR
FATAL
OFF

*/

var fs = require('fs');
var inputFile='../../logs/all.log';



function readLines(input, func) {
  var remaining = '';

  input.on('data', function(data) {
    remaining += data;
    var index = remaining.indexOf('\n');
    var last  = 0;
    while (index > -1) {
      var line = remaining.substring(last, index);
      last = index + 1;
      func(line);
      index = remaining.indexOf('\n', last);
    }

    remaining = remaining.substring(last);
  });

  input.on('end', function() {
    if (remaining.length > 0) {
      func(remaining);
    }
    dump();
  });
}


var traceStr = '';
var debugStr = '';
var infoStr = '';
var warnStr = '';
var errorStr = '';
var fatalStr = '';
var map = {
	trace: '[TRACE]',
	debug: '[DEBUG]',
	info: '[INFO]',
	warn: '[WARN]',
	error: '[ERROR]',
	fatal: '[FATAL]',
}

function func(data) {
  if(data.indexOf(map.trace)!=-1){
  	traceStr = traceStr + data + '\n';
  }else if(data.indexOf(map.debug)!=-1){
  	debugStr = debugStr + data + '\n';
  }else if(data.indexOf(map.info)!=-1){
  	infoStr = infoStr + data + '\n';
  }else if(data.indexOf(map.warn)!=-1){
  	warnStr = warnStr + data + '\n';
  }else if(data.indexOf(map.error)!=-1){
  	errorStr = errorStr + data + '\n';
  }else if(data.indexOf(map.fatal)!=-1){
  	fatalStr = fatalStr + data + '\n';
  }
}
function dump(){
	fs.writeFile('./result/trace.log', traceStr, function(err, data){});
	fs.writeFile('./result/debug.log', debugStr, function(err, data){});
	fs.writeFile('./result/info.log', infoStr, function(err, data){});
	fs.writeFile('./result/warn.log', warnStr, function(err, data){});
	fs.writeFile('./result/error.log', errorStr, function(err, data){});
	fs.writeFile('./result/fatal.log', fatalStr, function(err, data){});
}

var input = fs.createReadStream(inputFile);
readLines(input, func);