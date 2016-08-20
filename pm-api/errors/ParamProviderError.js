/**
 * Created by FanTaSyLin on 2016/8/18.
 * 参数提供错误
 */


"use strict"

function ParamProviderError(code, error) {
    Error.call(this, error.message);
    Error.captureStackTrace(this, this.constructor);
    this.name = "ParamProviderError";
    this.message = error.message;
    this.code = code;
    this.status = 415;
    this.inner = error;
}

ParamProviderError.prototype = Object.create(Error.prototype);
ParamProviderError.prototype.constructor = ParamProviderError;

module.exports = ParamProviderError;
