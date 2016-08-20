/**
 * Created by FanTaSyLin on 2016/8/18.
 * 数据库操作错误
 */

"use strict"

function DBOptionError(code, error) {
    Error.call(this, error.message);
    Error.captureStackTrace(this, this.constructor);
    this.name = "DBOptionError";
    this.message = error.message;
    this.code = code;
    this.status = 415;
    this.inner = error;
}

DBOptionError.prototype = Object.create(Error.prototype);
DBOptionError.prototype.constructor = DBOptionError;

module.exports = DBOptionError;
