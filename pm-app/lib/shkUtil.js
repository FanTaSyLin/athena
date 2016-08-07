/**
 * Created by FanTaSyLin on 2016/8/3.
 */

/**
 * 日期格式化
 * @param fmt
 * @returns string
 * exp:
 * new Date().format("yyyyMMdd hhmmss")
 * new Date().format("yyyy-MM-dd hh:mm:ss")
 * new Date().format("yy-M-d")
 * new Date().format("hh:mm:ss")
 * ....
 */
Date.prototype.format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

Date.prototype.utcDate = function () {
    var utcYYYY = this.getUTCFullYear();
    var utcMM = this.getUTCMonth() + 1;
    var utcdd = this.getUTCDate();
    var utcHH = this.getUTCHours();
    var utcmm = this.getUTCMinutes();
    var utcss = this.getUTCSeconds();
    return new Date(utcYYYY + '-' + utcMM + '-' + utcdd + ' ' + utcHH + ':' + utcmm + ':' + utcss);
}

Date.prototype.addDay = function (num) {
    var n = this.getTime() + num * 24 * 60 * 60 * 1000;
    return new Date(n);
}

Date.prototype.addHour = function (num) {
    var n = this.getTime() + num * 60 * 60 * 1000;
    return new Date(n);
}

Date.prototype.addSec = function (num) {
    var n = this.getTime() + num * 1000;
    return new Date(n);
}