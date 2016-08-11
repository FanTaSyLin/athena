/**
 * Created by FanTaSyLin on 2016/8/3.
 */

var debug = require('debug')('pm-app:' + process.pid);

module.exports.middleware = function () {

    var https = require('https');
    var _ = require('lodash');
    var config = require('./../config.js');
    var UnauthorizedAccessError = require('./../errors/UnauthorizedAccessError.js');

    var fetch = function (headers, cookie) {
        debug('fetch token');
        if (headers && headers.authorization) {
            var authorization = headers.authorization;
            var part = authorization.split(' ');
            debug('token : ' + part[1]);
            if (part.length === 2) {
                return part[1];
            } else {
                return null;
            }
        } else if (cookie) {
            var cookieObj = cookie;
            return cookieObj.token;
        } else {
            return null;
        }
    };

    var func = function (req, res, next) {
        debug('into middleware');
        var token = fetch(req.headers, req.cookies);



        var opts = {
            hostname: config.authAPI.host,
            port: config.authAPI.port,
            method: 'POST',
            path: '/api/verify/verify-token',
            rejectUnauthorized: false,
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Content-Length': 0,
                'Authorization': 'Bearer ' + token
            }
        }
        var request = https.request(opts, function (response) {
            if (response.statusCode === 200) {
                return next();
            }

            if (response.statusCode === 401) {
                return next(new UnauthorizedAccessError("invalid_token", new Error("token_invalid"), {
                    "message": "Token doesn't exists, are you sure it hasn't expired or been revoked?"
                }));
            }
            /*
             req.user = undefined;
             return next(new UnauthorizedAccessError("invalid_token", data));
             } else {
             req.user = _.merge(req.user, data);
             next();
             }
             });
             */
        });
        request.end();
    };

    func.unless = require('express-unless');

    return func;
}