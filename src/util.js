var Util = {
	getInTime: function(time){
		var time = Math.round(time/1000);
	    return `FROM_UNIXTIME(${time})`;
	},
	getOutTime: function(time){
		return `UNIX_TIMESTAMP(${time})*1000`;
	}
}
module.exports = Util;
