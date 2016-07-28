/**
 * Created by FanTaSyLin on 2016/7/20.
 */


var debug = require('debug')('app:utils: ' + process.pid);
var _ = require('lodash');
var path = require('path');
var redis = require('redis');
var client = redis.createClient(6379, '192.168.226.138');
var config = require('./config.js');
var jsonWebToken = require('jsonwebtoken');
var UnauthorizedAccessError = require(path.join(__dirname, '../errors', 'UnauthorizedAccessError'));

const TOKEN_EXPIRATION = 60;
const TOKEN_EXPIRATION_SEC = TOKEN_EXPIRATION * 60;

client.on('error', function (err) {
    debug(err);
});

client.on('connect', function () {
    debug("Redis successful connected");
})

/**
 * Find the authorization headers from the headers in the request
 *
 * @param headers
 * @returns {*}
 */
module.exports.fetch = function (headers) {
    if (headers && headers.authorization) {
        var authorization = headers.authorization;
        var part = authorization.split(' ');
        if (part.length === 2) {
            var token = part[1];
            return token;
        } else {
            return null;
        }
    } else {
        return null;
    }
}

/**
 * Fetch the token from redis for the given key
 *
 * @param id
 * @param done
 * @returns {*}
 */
module.exports.retrieve = function (id, done) {
    debug("Calling retrieve for token: %s", id);
    if (_.isNull(id)) {
        return done(new Error("token_invalid"), {
            "message": "Invalid token"
        });
    }

    client.get(id, function (err, reply) {
        if (err) {
            return done(err, {
                "message": err
            });
        }

        if (_.isNull(reply)) {
            return done(new Error("token_invalid"), {
                "message": "Token doesn't exists, are you sure it hasn't expired or been revoked?"
            });
        } else {
            var data = JSON.parse(reply);
            debug("User data fetched from redis store for user: %s", data.username);
            if (_.isEqual(data.token, id)) {
                return done(null, data);
            } else {
                return done(new Error("token_doesnt_exist"), {
                    "message": "Token doesn't exists, login into the system so it can generate new token."
                });
            }
        }
    })
}

/**
 * Middleware for getting the token into the user
 *
 * @param req
 * @param res
 * @param next
 */
module.exports.middleware = function () {
    var func = function (req, res, next) {
        var token = exports.fetch(req.headers);

        exports.retrieve(token, function (err, data) {
            if (err) {
                req.user = undefined;
                return next(new UnauthorizedAccessError("invalid_token", data));
            } else {
                req.user = _.merge(req.user, data);
                next();
            }
        })
    };

    func.unless = require('express-unless');
    return func;
}

/**
 * Creates a new token for the user that has been logged in
 *
 * @param user
 * @param req
 * @param res
 * @param next
 *
 * @returns {*}
 */
module.exports.create = function (user, req, res, next) {
    debug('Create token');

    if (_.isEmpty(user)) {
        return next(new Error('User data cannot be empty.'));
    }

    var data = {
        _id: user._id,
        username: user.username,
        access: user.access,
        name: user.name,
        email: user.email
    };
    data.token = jsonWebToken.sign({_id: user._id}, config.secret, {expiresIn: TOKEN_EXPIRATION});

    var decoded = jsonWebToken.decode(data.token);
    data.token_exp = decoded.exp;
    data.token_iat = decoded.iat;

    debug("Token generated for user: %s, token: %s", data.username, data.token);
    client.set(data.token, JSON.stringify(data), function (err, reply) {
        if (err) {
            return next(new Error(err));
        }
        if (reply) {
            client.expire(data.token, TOKEN_EXPIRATION_SEC, function (err, reply) {
                if (err) {
                    return next(new Error('Can not set the expire value for the token key'));
                }
                if (reply) {
                    req.user = data;
                    next(); // we have succeeded
                } else {
                    return next(new Error('Expiration not set on redis'));
                }
            });
        } else {
            return next(new Error('Token not set in redis'));
        }
    });
    return data;
};


