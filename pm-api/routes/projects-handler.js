/**
 * Created by FanTaSyLin on 2016/9/5.
 */

'use strict';

var _ = require('lodash');
var ParamProviderError = require('./../errors/ParamProviderError.js');
var DBOptionError = require('./../errors/DBOptionError.js');
var ProjectSchema = require('./../modules/project-schema.js');

module.exports = function (server, BASEPATH) {

    /**
     * 获取项目列表
     * GET /project/projectlist/:account
     */
    server.get({
        path: BASEPATH + '/project/projectlist/:account',
        version: '0.0.1'
    }, getListByAccount);

    /**
     * 获取项目列表
     * GET /project/projectlist
     */
    server.get({
        path: BASEPATH + '/project/projectlist/:account',
        version: '0.0.1'
    }, getList);

    /**
     * 创建新项目
     * POST /project
     * body 参考 ProjectSchema
     */
    server.post({
        path: BASEPATH + '/project'
    }, createProject);
};

function getList(req, res, next) {
    ProjectSchema.find({}, function (err, doc) {
        if (err) {
            return next(err);
        }

        var projects = [];

        doc.forEach(function (item) {
            projects.push(item);
        });

        res.end(JSON.stringify(projects));
        return next();
    });
}

function getListByAccount(req, res, next) {
    var account = req.params['account'];
    ProjectSchema.find({
        'members.account': account
    }, {'cnName': 1, 'enName': 1, 'type': 1}, function (err, doc) {
        if (err) {
            return next(err);
        }

        var projects = [];

        doc.forEach(function (item) {
            projects.push(item);
        });

        res.end(JSON.stringify(projects));
        return next();
    });
}

function createProject(req, res, next) {
    if (_.isUndefined(req.body)) {
        return next(new ParamProviderError(415, {
            message: 'Invalid params'
        }));
    }

    var project = new ProjectSchema();
    var body = req.body;
    try {
        project.initData(body);
    } catch (err) {
        return next(err);
    }

    project.save(function (err) {
        if (err) {
            return next(new DBOptionError(415, err));
        } else {
            res.end();
        }
    });
}