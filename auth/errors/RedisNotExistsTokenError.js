/**
 * Created by FanTaSyLin on 2016/7/28.
 * Redis中不存在此Token,应对Redis挂掉导致的缓存数据丢失
 */
"use strict"

function RedisNotExistsTokenError(code, error) {
    Error.call(this, error.message);
    Error.captureStackTrace(this, this.constructor);
    this.name = "RedisNotExistsTokenError";
    this.message = error.message;
    this.code = code;
    this.status = 401;
    this.inner = error;
}

RedisNotExistsTokenError.prototype = Object.create(Error.prototype);
RedisNotExistsTokenError.prototype.constructor = RedisNotExistsTokenError;

module.exports = UnauthorizedAccessError;