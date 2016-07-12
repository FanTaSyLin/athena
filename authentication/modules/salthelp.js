/* 
 *  Create by fantasylin on Fri 08 Jul 2016 05:41:35 PM CST 
 *  salt 生成器 
 */ 



exports.create = function () {
	var nowTime = new Date();
	var baseTime = new Date("2000-01-01 12:00:00");
	var secDiff = nowTime - baseTime;
	var ms = nowTime.getMilliseconds();
	var salt = secDiff * 1000 + ms;
	return salt.toString();
};
