/**
 * Created by FanTaSyLin on 2016/7/27.
 */

var debug = require('debug')('app: ' + process.pid);
var path = require('path');
var Router = require('express').Router;
var User = require(path.join(__dirname, "..", "modules", "user.js"));
var UnauthorizedAccessError = require(path.join(__dirname, '..', 'errors', 'UnauthorizedAccessError.js'));

module.exports = function () {
    var router = new Router();

    router.route('/signin').post(signIn);

    router.route('/verifyonly').post(verifyOnly);

    router.route('/changepwd').post(userChangePwd);

    return router;
};

function signIn(req, res, next) {
    debug('Sign-in new user');
    var username = (req.body && req.body.username) || (req.params && req.params.username);
    var password = (req.body && req.body.password) || (req.params && req.params.password);
    debug('username: %s', username);
    debug('password: %s', password);
    var user = new User();
    user.username = username;
    user.password = password;
    user.salt = "1";
    user.save(function (err) {
        if (err) {
            debug(err.stack);
            return next(err);
        } else {
            debug('Sign-in user successful');
            res.status(200).json(user.username);
            return;
        }
    });
}

function verifyOnly(req, res, next) {
    debug('Verify username Only');
    var username = (req.body && req.body.username) || (req.params && req.params.username);
    debug('username: %s', username);
    process.nextTick(function () {
        User.findOne({
            username: username
        }, function (err, user) {
            if (err) {
                return next(err);
            }
            if(user) {
                debug('username is not Only');
                res.status(200).json(false);
            } else {
                debug('username is Only');
                res.status(200).json(true);
            }
        });
    });
}

function userChangePwd(req, res, next) {
    debug('Change password');
    var username = (req.body && req.body.username) || (req.params && req.params.username);
    var orgPassword = (req.body && req.body.orgpassword) || (req.params && req.params.orgpassword);
    var newPassword = (req.body && req.body.newpassword) || (req.params && req.params.newpassword);
    debug('username: %s', username);
    debug('orgPassword: %s', orgPassword);
    debug('newPassword: %s', newPassword);
    process.nextTick(function () {
        User.findOne({
            username : username
        }, function (err, user) {
            if (err || !user) {
                debug(err.stack);
                return next(new UnauthorizedAccessError("401", {
                    message: 'Invalid username or password'
                }));
            }
            debug('The user has been found');
            debug('user.username: %s', user.username);
            debug('user.password: %s', user.password);
            debug('user.salt: %s', user.salt);
            user.comparePassword(orgPassword, function (err, isMatch) {
                if (isMatch && !err) {
                    debug('User authenticated, next change password');
                    var o = user.createNewPassword(newPassword);
                    debug('new password: %s', user.password);
                    debug('new salt: %s', user.salt);
                    var update =  { $set: { password: user.password, salt: user.salt }};
                    User.update({_id : user._id}, update, {}, function (err, docs) {
                        if (err) {
                            debug('change password failed err.stack: %s', err.stack);
                            return next(err);
                        }
                        debug(docs);
                        debug('change password success:');
                        res.status(200).json(user);
                        return next();
                    });

                } else {
                    debug('The user org-password is mistake');
                    return next(new UnauthorizedAccessError('401', {
                        message : 'Invalid username or password'
                    }));
                }
            })
        });
    });
}