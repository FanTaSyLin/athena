/**
 * Created by FanTaSyLin on 2016/8/18.
 * 数据校验错误
 */

"use strict"

function DataVerifyError(code, error) {
    Error.call(this, error.message);
    Error.captureStackTrace(this, this.constructor);
    this.name = "DataVerifyError";
    this.message = error.message;
    this.code = code;
    this.status = 415;
    this.inner = error;
}

DataVerifyError.prototype = Object.create(Error.prototype);
DataVerifyError.prototype.constructor = DataVerifyError;

module.exports = DataVerifyError;