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


debug('Create RESTful Server');
var server = restify.createServer({
    name: 'PMSoft-API'
});

server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(restify.CORS());

/**
 * POST - insert
 * PUT - update
 * GET - find
 */

const BASEPATH = '/api';
var jobRecodeHandler = require('./routes/jobrecodehandler.js')();
var sysConfigHandler = require('./routes/sysconfighandler.js')();
var userInfoHandler = require('./routes/userInfohandler.js')();
var projectHandler = require('./routes/projecthandler.js')();


/**
 * 员工信息注册
 */
server.post({
    path: BASEPATH + '/userinfo',
    version: '0.0.1'
}, userInfoHandler.create);

server.get({
    path: BASEPATH + '/employee',
    version: '0.0.1'
}, userInfoHandler.getEmployee);


/**
 * 系统设置相关API
 */
server.post({
    path: BASEPATH + '/sysconfig/dptgroup',
    version: '0.0.1'
}, sysConfigHandler.insertDptGroup);

server.get({
    path: BASEPATH + '/sysconfig/dptgroup',
    version: '0.0.1'
}, sysConfigHandler.getDptGroup);

server.put({
    path: BASEPATH + '/sysconfig/dptgroup/delete',
    version: '0.0.1'
}, sysConfigHandler.deleteDptGroup);

server.put({
    path: BASEPATH + '/sysconfig/dptgroup/update',
    version: '0.0.1'
}, sysConfigHandler.updateDptGroup);

server.post({
    path: BASEPATH + '/sysconfig/department',
    version: '0.0.1'
}, sysConfigHandler.insertDepartment);

server.get({
    path: BASEPATH + '/sysconfig/department',
    version: '0.0.1'
}, sysConfigHandler.getDepartment);

server.put({
    path: BASEPATH + '/sysconfig/department/delete',
    version: '0.0.1'
}, sysConfigHandler.deleteDepartment);

server.put({
    path: BASEPATH + '/sysconfig/department/update',
    version: '0.0.1'
}, sysConfigHandler.updateDepartment);

/**
 * 项目相关API
 */

server.post({
    path: BASEPATH + '/project'
}, projectHandler.create);


/**
 * 工作记录相关API
 */
server.post({
    path: BASEPATH + '/jobrecode/:projectid',
    version: '0.0.1'
}, jobRecodeHandler.insert);

server.put({
    path: BASEPATH + '/jobrecode/:projectid/:joblogid',
    version: '0.0.1'
}, jobRecodeHandler.update);

server.get({
    path: BASEPATH + '/jobrecode/:user/:projectid',
    version: '0.0.1'
}, jobRecodeHandler.find);

server.get({
    path: BASEPATH + '/jobrecode/:user',
    version: '0.0.1'
}, jobRecodeHandler.find);


server.listen(HTTP_PORT, function () {
    debug('%s listening at %s ', server.name, server.url);
});


