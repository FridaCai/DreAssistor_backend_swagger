//# open dreassistor.dump.
//#find sed 's/AUTO_INCREMENT=[0-9]*//' and replace with "".
//# over. 

//# in windows, so hard to do it with dos when there is '=' in the string to be replaced.
//# wonder whether lenovo os is pirate :<


var fs = require('fs');
var inputFile = 'db/dreassistor_schema.dump';
var tmpFile = 'db/tmp.dump';

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

var newStr = '';
function func(line){
	var newline = line.replace(/AUTO_INCREMENT=[0-9]*/g, '');
	newStr = newStr + newline + '\n';
}

function dump(){
	fs.writeFileSync(tmpFile, newStr, 'utf8');
	fs.unlinkSync(inputFile);
	fs.renameSync(tmpFile, inputFile);
}

var input = fs.createReadStream(inputFile);
readLines(input, func); 