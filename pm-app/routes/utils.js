/**
 * Created by FanTaSyLin on 2016/8/3.
 */

module.exports.middleware = function () {

    var https = require('https');
    var _ = require('lodash');
    var config = require('./../config.js');
    var UnauthorizedAccessError = require('./../errors/UnauthorizedAccessError.js');

    var fetch = function (headers) {
        if (headers && headers.authorization) {
            var authorization = headers.authorization;
            var part = authorization.split(' ');
            if (part.length === 2) {
                return part[1];
            } else {
                return null;
            }
        } else {
            return null;
        }
    };

    var func = function (req, res, next) {
        var token = fetch(req.headers);
        var opts = {
            hostname: config.authAPI.host,
            port: config.authAPI.port,
            method: 'POST',
            path: '/api/verify/verify-token',
            rejectUnauthorized: false,
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Content-Length': 0,
                'Authorization': 'Basic' + token
            }
        }
        var req = https.request(opts, function (res) {
            if (res.statusCode === 200) {
                res.on('data', function (data) {
                    console.log(data);
                });

                res.on('end', function () {
                    console.log('1');
                })
            }

            if (res.statusCode === 401) {
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
        req.end();
    };

    func.unless = require('express-unless');

    return func;
}