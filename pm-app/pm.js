/**
 * Created by FanTaSyLin on 2016/7/28.
 */

const HTTPS_PORT = process.env.HTTPS_PORT || 4402;

var debug = require('debug')('pm-app:' + process.pid);
var morgan = require("morgan");
var express = require('express');
var path = require('path');
var fs = require('fs');
var https = require('https');
var onFinished = require('on-finished');
var config = require('./config.js');
var utils = require('./routes/utils.js');
var NotFoundError = require('./errors/NotFoundError.js');
var expressJWT = require('express-jwt');
var unless = require('express-unless');

debug('Initializing express');
var app = express();

debug('Attaching plugins');
var bodyParser = require('body-parser');

app.use(morgan("dev"));
app.use(express.static("./app"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'app')));

app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')
    if(req.method=="OPTIONS")
        res.send(200);/*让options请求快速返回*/
    else
        next();
});

app.use(function (req, res, next) {
    onFinished(res, function (err) {
        debug("[%s] finished request", req.connection.remoteAddress);
    });
    next();
});

var jwtCheck = expressJWT({
    secret: config.secret
});

jwtCheck.unless = unless;

app.use(jwtCheck.unless({ path : '/login' }));

app.use(utils.middleware().unless({ path : '/login' }));

app.use("/", require('./routes/user.js')());


//其他一切资源均重定位到 404-未找到
app.all("*", function (req, res, next) {
    next(new NotFoundError("404"));
})


// 错误处理中间件 （所有错误应在此处理 而不是在其他中间件中处理）
app.use(function (err, req, res, next) {
    var code = 500;
    var msg = err.stack || {message: "Internal Server Error 1"};
    switch (err.name) {
        case "UnauthorizedError":
        case "UnauthorizedAccessError":
            code = err.status;
            msg = undefined;
            return res.status(code).sendfile('app/auth.html');
            break;
        case "BadRequestError":
        case 'NotFoundError':
            code = err.status;
            msg = err.inner;
            break;
        default:
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

debug("Creating HTTP server on port: %s", 4002);
require('http').createServer(app).listen(4002, function () {
    debug("HTTP Server listening on port: %s, in %s mode", 4002, app.get('env'));
});