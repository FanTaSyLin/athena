/**
 * Created by FanTaSyLin on 2016/7/26.
 */

var debug = require('debug')('auth: ' + process.pid);
var path = require('path');
var _ = require('lodash');
var jsonWebToken = require('jsonwebtoken');
var redis = require('redis');
var config = require('../config.js');
var UnauthorizedAccessError = require(path.join(__dirname, '..', 'errors', 'UnauthorizedAccessError.js'));
var RedisNotExistsTokenError = require(path.join(__dirname, '..', 'errors', 'RedisNotExistsTokenError.js'));
var client = redis.createClient(config.redis.port, config.redis.host);

const TOKEN_EXPIRATION = 7 * 24 * 60;
const TOKEN_EXPIRATION_SEC = TOKEN_EXPIRATION * 60;

client.on('error', function (err) {
    debug(err);
});

client.on('connect', function () {
    debug("Redis successfully connected");
});

module.exports.createNewToken = function (user, cb) {
    debug('Create token');

    if (_.isEmpty(user)) {
        return cb(new Error('User data cannot be empty.'));
    }

    var data = {
        _id : user._id,
        username : user.username,
        phone : user.phone,
        email : user.email,
        token : jsonWebToken.sign({_id:user._id}, config.secret, {expiresIn : TOKEN_EXPIRATION_SEC})
    };

    debug("Token generated for user: %s, token: %s", data.username, data.token);
    debug("Save the Token in redis");
    client.set(data.token, JSON.stringify(data), function (err, reply) {
        if (err) {
            debug("Save error: \r\n%s", err.stack);
            return cb(new Error(err));
        }

        if (reply) {
            debug("Set token expire");
            client.expire(data.token, TOKEN_EXPIRATION_SEC, function (err, reply) {
                if (err) {
                    debug("Set token expire err: \r\n%s", err.stack);
                    return cb(new Error("Can not set the expire value for the token key"));
                }
                if (reply) {
                    debug("Set token expire success: \r\n%d", TOKEN_EXPIRATION_SEC);
                    cb(null, data);
                } else {
                    debug("Expiration not set on redis");
                    return cb(new Error('Expiration not set on redis'));
                }
            });
        } else {
            debug("Token not set in redis");
            return cb(new Error('Token not set in redis'));
        }

    });

    return data;
}

module.exports.verifyToken = function (token, cb) {
    if (_.isNull(token)) {
        return cb(new Error("token_invalid"));
    }

    client.get(token, function (err, reply) {
        if (err) {
            return cb(new Error(err));
        }

        if (_.isNull(reply)) {
            return cb(new Error("Token doesn't exists, are you sure it hasn't expired or been revoked?", "token_invalid"));
        } else {
            var data = JSON.parse(reply);
            debug("User data fetched from redis store for user: %s", data.username);
            if (_.isEqual(data.token, token)) {
                return cb(null, data);
            } else {
                return cb(new Error("Token doesn't exists, login into the system so it can generate new token.", "token_invalid"));
            }
        }
    })
}

module.exports.expireToken = function (token) {

    if (token !== null) {
        //client.set(token, {is_expired : true});
        client.expire(token, 0);
    }

    return token !== null;
}