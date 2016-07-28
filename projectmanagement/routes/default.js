/**
 * Created by FanTaSyLin on 2016/7/20.
 */

var debug = require('debug')('app:routes:default' + process.pid);
var _ = require('lodash');
var util = require('util');
var path = require('path');
var myUtil = require('../utils.js');
var Router = require('express').Router;
var UnauthorizedAccessError = require(path.join(__dirname, '..', '..', 'errors', 'UnauthorizedAccessError.js'));
var User = require(path.join(__dirname, '..', 'models', 'user.js'));
var jwt = require('express-jwt');

var authenticate = function (req, res, next) {
    debug('Processing authenticate middleware');
    var username = req.body.username;
    var password = req.body.password;

    if (_.isEmpty(username) || _.isEmpty(password)) {
        return next(new UnauthorizedAccessError("401", {
            message: 'Invalid username or password'
        }));
    }

    process.nextTick(function () {
        User.findOne({
            username : username
        }, function (err, user) {
            if (err || !user) {
                return next(new UnauthorizedAccessError("401", {
                    message: 'Invalid username or password'
                }));
            }
            user.comparePassword(password, function (err, isMatch) {
                if (isMatch && !err) {
                    debug('User authenticated, generating token');
                    myUtil.create(user, req, res, next);
                } else {
                    return next(new UnauthorizedAccessError('401', {
                        message : 'Invalid username or password'
                    }));
                }
            });
        });
    });
}

module.exports = function () {
    var router = new Router();
    router.route("/verify").get(function (req, res, next) {
        return res.status(200).json(undefined);
    });

    router.route('/logout').get(function (req, res, next) {
        if (utils.expire(req.headers)) {
            delete req.user;
            return res.status(200).json({
                message: "User has been successfully logged out"
            });
        }
    });

    router.route('/login').post(authenticate, function (req, res, next) {
        return res.status(200).json(req.user);
    });

    router.unless = require('express-unless');
    return router;
}

debug("Loaded");