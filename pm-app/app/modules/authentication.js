/**
 * Created by FanTaSyLin on 2016/7/29.
 */

var https = require('https');

exports.login = function (user, cb) {
    var option = {
        hostname : 'localhost',
        port: 4401,
        method: 'POST',
        path: '/api/verify/login',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Content-Length': JSON.stringify(user).length
        }
    }
    
    https.request(option, function (err, data) {
        if (err) {
            return cb(err);
        }
        var user = JSON.parse(data);
        return cb(null, user);
    });
}