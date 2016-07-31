/**
 * Created by FanTaSyLin on 2016/7/28.
 */

const HTTPS_PORT = process.env.HTTPS_PORT || 4402;

var debug = require('debug')('pm-app:' + process.pid);
var express = require('express');
var path = require('path');
var fs = require('fs');
var https = require('https');
var onFinished = require('on-finished');
var config = require('./config.js');
var NotFoundError = require('./errors/NotFoundError.js');

debug('Initializing express');
var app = express();


debug('Attaching plugins');
var bodyParser = require('body-parser');
var routes = require('./routes/routes.js');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(express.static(path.join(__dirname, 'app')));

app.use(function (req, res, next) {
    onFinished(res, function (err) {
        debug("[%s] finished request", req.connection.remoteAddress);
    });
    next();
});

app.get('/login', routes.user.login);


//其他一切资源均重定位到 404-未找到
app.all("*", function (req, res, next) {
    next(new NotFoundError("404"));
})


// 错误处理中间件 （所有错误应在此处理 而不是在其他中间件中处理）
app.use(function (err, req, res, next) {
    var code = 500;
    var msg = {message: "Internal Server Error"};
    switch (err.name) {
        case 'NotFoundError':
            code = err.status;
            msg = err.inner;
            break;
    }
    return res.status(code).json(msg);
});


debug("Creating HTTPS server on port: %s", HTTPS_PORT);
require('https').createServer({
    key: fs.readFileSync(path.join(__dirname, "keys", "server.key")),
    cert: fs.readFileSync(path.join(__dirname, "keys", "server.crt")),
    ca: fs.readFileSync(path.join(__dirname, "keys", "ca.crt")),
    requestCert: true,
    rejectUnauthorized: false
}, app).listen(HTTPS_PORT, function () {
    debug("HTTPS Server listening on port: %s, in %s mode", HTTPS_PORT, app.get('env'));
});