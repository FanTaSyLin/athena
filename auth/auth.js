/**
 * Created by FanTaSyLin on 2016/7/25.
 */

const MONGOOSE_URI = process.env.MONGOOSE_URI || "123.56.135.196/authentication";
//const MONGOOSE_URI = process.env.MONGOOSE_URI || "192.168.226.138/pm-db";
const HTTPS_PORT = process.env.HTTPS_PORT || 4401;

var https = require('https');
var debug = require('debug')('auth: ' + process.pid);
var path = require('path');
var fs = require('fs');
var jwt = require('express-jwt');
var unless = require('express-unless');
var NotFoundError = require(path.join(__dirname, 'errors', 'NotFoundError.js'));
var mongoose = require('mongoose');
var express = require('express');
var config = require('./config.js');


debug('Starting Auth application');

mongoose.connect(MONGOOSE_URI);

mongoose.connection.on('error', function (err) {
    debug('Mongoose connection error: %s', err.stack);
});

mongoose.connection.on('open', function () {
    debug('Mongoose connected to the authentication');
});

debug('Initializing express');

var app = express();

debug('Attaching plugins');

var bodyParser = require('body-parser');
var morgan = require('morgan');
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.use(function (req, res, next) {
    next();
});

app.use('/api/verify', require(path.join(__dirname, 'routes', 'route_verify.js'))());

app.use('/api/user', require(path.join(__dirname, 'routes', 'route_useropt.js'))());

app.all("*", function (req, res, next) {
    next(new NotFoundError('404'));
});

app.use(function (err, req, res, next) {
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

debug('Creating HTTPS server on port: %s', HTTPS_PORT);
https.createServer({
    key: fs.readFileSync(path.join(__dirname, "keys", "server.key")),
    cert: fs.readFileSync(path.join(__dirname, "keys", "server.crt")),
    ca: fs.readFileSync(path.join(__dirname, "keys", "ca.crt")),
    requestCert: true,
    rejectUnauthorized: false
}, app).listen(HTTPS_PORT, function () {
    debug("HTTPS Server listening on port: %s, in %s mode", HTTPS_PORT, app.get('env'));
});