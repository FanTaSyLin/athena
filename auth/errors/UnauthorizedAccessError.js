/**
 * Created by FanTaSyLin on 2016/7/18.
 * 未经授权的访问错误
 */

"use strict"

function UnauthorizedAccessError(code, error) {
    Error.call(this, error.message);
    Error.captureStackTrace(this, this.constructor);
    this.name = "UnauthorizedAccessError";
    this.message = error.message;
    this.code = code;
    this.status = 401;
    this.inner = error;
}

UnauthorizedAccessError.prototype = Object.create(Error.prototype);
UnauthorizedAccessError.prototype.constructor = UnauthorizedAccessError;

module.exports = UnauthorizedAccessError;