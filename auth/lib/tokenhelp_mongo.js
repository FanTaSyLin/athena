/**
 * Created by FanTaSyLin on 2016/8/8.
 */

const TOKEN_EXPIRATION = 7 * 24 * 60;
const TOKEN_EXPIRATION_SEC = TOKEN_EXPIRATION * 60;

var debug = require('debug')('auth: ' + process.pid);
var _ = require('lodash');
var jsonWebToken = require('jsonwebtoken');
var UnauthorizedAccessError = require('../errors/UnauthorizedAccessError.js');
var Token = require('../modules/token.js');
var config = require('../config.js');

/*
 * Create new token
 *
 */
module.exports.createNewToken = function (user, cb) {
    debug('createNewToken');

    if (_.isEmpty(user)) {
        return cb(new Error('User data cannot be empty.'));
    }

    var item = new Token();

    item.token = jsonWebToken.sign({_id:user._id}, config.secret, {expiresIn : TOKEN_EXPIRATION_SEC});
    item.username = user.username;
    item.lifetime = new Date(new Date().getTime() + (TOKEN_EXPIRATION_SEC * 1000));

    debug("Token generated for user: %s, token: %s", item.username, item.token);
    debug("Save the Token in MongoDB");

    item.save(function (err) {
        if (err) {
            debug("Save error: \r\n%s", err.stack);
            return cb(new Error(err));
        } else {
            return cb(null, {
                token : item.token,
                username : item.username
            });
        }
    });

};

module.exports.verifyToken = function (token, cb) {

    if (_.isNull(token)) {
        return cb(new Error("token_invalid"));
    }

    process.nextTick(function () {
        Token.findOne({
            token: token
        }, function (err, data) {
            if (err) {
                return cb(err);
            }

            if (data) {
                data.checkValid();
                if (data.isValid) {
                    return cb(null, {
                        token: data.token,
                        username: data.username
                    });
                } else {
                    return cb(new UnauthorizedAccessError("401", {
                        message: 'Invalid token'
                    }));
                }
            } else {
                return cb(new UnauthorizedAccessError("401", {
                    message: 'Invalid token'
                }));
            }

        });
    });
};

module.exports.expireToken = function (token) {
    Token.remove({
        token: token
    }, function (err) {

    });
};

