var Util = {
	getUnixTime: function(time){
		var time = Math.round(time/1000);
	    return `FROM_UNIXTIME(${time})`;
	}
}
module.exports = Util;