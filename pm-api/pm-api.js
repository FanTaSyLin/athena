/**
 * Created by FanTaSyLin on 2016/8/17.
 */

const HTTP_PORT = process.env.HTTP_PORT || 4003;
const MONGOOSE_URI = process.env.MONGOOSE_URI || "123.56.135.196/pmsoft";

var debug = require('debug')('pm-soft-api');
var morgan = require('morgan');
var mongoose = require('mongoose');
var restify = require('restify');
var fs = require('fs');
var path = require('path');
var config = require('./config.js');

debug('Connect MongoDB');
var opt_Mongoose = {
    server: {
        auto_reconnect: true,
        poolSize: 100
    }
};

mongoose.connect(MONGOOSE_URI, opt_Mongoose);

mongoose.connection.on('error', function (err) {
    debug('Mongoose connection error: %s', err.stack);
});

mongoose.connection.on('open', function () {
    debug('Mongoose connected to the PMSoft-Mongo');
});

mongoose.Promise = global.Promise;

debug('Create RESTful Server');
var server = restify.createServer({
    name: 'PMSoft-API'
});

server.use(morgan("dev"));
server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(restify.CORS());

/**
 * POST - insert
 * PUT - update
 * GET - find
 */

const BASEPATH = '/api';

/**
 * 员工信息相关api
 */
require('./routes/userinfo-handler.js')(server, BASEPATH);

/**
 * 系统设置相关API
 */
require('./routes/sysconfig-handler.js')(server, BASEPATH);

/**
 * 项目相关API
 */
require('./routes/projects-handler.js')(server, BASEPATH);

/**
 * 工作记录相关API
 */
require('./routes/jobrecode-handler.js')(server, BASEPATH);


server.listen(HTTP_PORT, function () {
    debug('%s listening at %s ', server.name, server.url);
});


