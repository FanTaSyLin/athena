/**
 * Created by FanTaSyLin on 2016/7/26.
 */
"use strict";
var debug = require('debug')('auth: ' + process.pid);
var Router = require('express').Router;
var path = require('path');
var User = require(path.join(__dirname, '..', 'modules', 'user.js'));
var tokenHelp = require(path.join(__dirname, '..', 'lib', 'tokenhelp.js'));
var UnauthorizedAccessError = require(path.join(__dirname, '..', 'errors', 'UnauthorizedAccessError.js'));
var _ = require('lodash');

module.exports = function () {
    var router = new Router();

    router.route('/login').post(authentication);

    router.route('/verify-token').post(authVerify);

    router.route('/logout').post(expireToken);

    return router;
}

function authentication(req, res, next) {
    debug('Processing authenticate middleware');
    var username = (req.body && req.body.username) || (req.query && req.query.username);
    var password = (req.body && req.body.password) || (req.query && req.query.password);
    debug('user.username: %s', username);
    debug('user.password: %s', password);
    if (_.isEmpty(username) || _.isEmpty(password)) {
        debug('username or password is Empty');
        return next(new UnauthorizedAccessError('401', {
            message: 'Username or password is empty'
        }));
    }
    
    process.nextTick(function () {
        User.findOne({
            username : username
        }, function (err, user) {
            if (err || !user) {
                debug('Invalid username, not found username');
                return next(new UnauthorizedAccessError("401", {
                    message: 'Invalid username or password'
                }));
            }

            debug('Compare password');

            user.comparePassword(password, function (err, isMatch) {
                if (isMatch && !err) {
                    debug('User authenticated, generating token');
                    tokenHelp.createNewToken(user, function (err, user) {
                        if (err) {
                            debug('createNewToken error: \r\n %s', err.stack);
                            return next (err);
                        }''
                        //res.status(200).json(user);
                        res.writeHead(200, {'Content-type' : 'application/json; charset=utf-8'});
                        res.write(JSON.stringify(user));
                        res.end();

                        //TODO: 是否需要将data 存储入数据库
                    });

                } else {
                    return next(new UnauthorizedAccessError('401', {
                        message : 'Invalid username or password'
                    }));
                }
            })
        });
    });
}

function authVerify(req, res, next) {
    debug('verify token');
    var token = (req.body && req.body.token) || (req.query && req.query.token) || req.headers['x-access-token'];
    debug('token: %s', token);
    process.nextTick(function() {
        tokenHelp.verifyToken(token, function (err, user) {
            if (err) {
                debug('verify token error: \r\n%s', err.stack);
                return next(new UnauthorizedAccessError("invalid_token", err));
            } else {
                debug('verify token success: \r\n%s', JSON.stringify(user));
                res.status(200).json(user);
                //return next();
            }
        });
    });
}

function expireToken(req, res, next) {
    debug('set token expire');
    var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'];
    debug('token: %s', token);
    process.nextTick(function () {
        if (tokenHelp.expireToken(token)) {
            debug('set token expire success');
            res.status(200);
        } else {
            debug('set token expire failed');
            return next(new UnauthorizedAccessError("401"));
        }
    });
}