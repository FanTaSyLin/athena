/**
 * Created by FanTaSyLin on 2016/7/12.
 */

"use strict";
const mongoose_uri = process.env.MONGOOSE_URI || "192.168.226.138/pm-db";

var http = require('http');
var https = require('https');
var debug = require('debug')('app:' + process.pid);
var path = require('path');
var fs = require('fs');
var http_port = process.env.HTTP_PORT || 4001;
var https_port = process.env.HTTPS_PORT || 4401;
var jwt = require('express-jwt');
var mongoose = require('mongoose');
var onFinished = require('on-finished');
var unless = require('express-unless');
var config = require('./config.js');
var utils = require(path.join(__dirname, "utils.js"))
var NotFoundError = require(path.join(__dirname, "../errors", "NotFoundError.js"))

debug("Starting application");

mongoose.connect(mongoose_uri);

mongoose.connection.on('error', function () {
    debug('Mongoose connection error');
});

mongoose.connection.on('open', function () {
   debug('Mongoose connected to the pm-db');
});

debug('Initializing express');

var app = require('express')();

debug('Attaching plugins');

var morgan = require('morgan');
var bodyParser = require('body-parser');
var compression = require('compression');
var resTime = require('response-time');

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(compression());
app.use(resTime());
app.use(function (req, res, next) {
    onFinished(res, function (err) {
        debug("[%s] finished request", req.connection.remoteAddress);
    });
    next();
});

var jwtCheck = jwt({
    secret: config.secret
});

jwtCheck.unless = unless;

app.use(jwtCheck.unless({path: '/api/login'}));
app.use(utils.middleware().unless({path: '/api/login'}));

app.use("/api", require(path.join(__dirname, "routes", "default.js"))());

app.all("*", function (req, res, next) {
    next(new NotFoundError('404'));
});

app.use(function (err, req, res, next) {
    var errorType = typeof err;
    var code = 500;
    var msg = {message: "Internal Server Error"};

    switch (err.name) {
        case "UnauthorizedError":
            code = err.status;
            msg = undefined;
            break;
        case "BadRequestError":
        case "UnauthorizedAccessError":
        case "NotFoundError":
            code = err.status;
            msg = err.inner;
            break;
        default:
            break;
    }

    return res.status(code).json(msg);
});

console.log("Creating HTTP server on port: %s", http_port);
http.createServer(app).listen(http_port, function () {
    console.log("HTTP Server listening on port: %s, in %s mode", http_port, app.get('env'));
});

console.log("Creating HTTPS server on port: %s", https_port);
https.createServer({
    key: fs.readFileSync(path.join(__dirname, "keys", "server.key")),
    cert: fs.readFileSync(path.join(__dirname, "keys", "server.crt")),
    ca: fs.readFileSync(path.join(__dirname, "keys", "ca.crt")),
    requestCert: true,
    rejectUnauthorized: false
}, app).listen(https_port, function () {
    console.log("HTTPS Server listening on port: %s, in %s mode", https_port, app.get('env'));
});