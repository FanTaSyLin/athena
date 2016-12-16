/**
 * Created by FanTaSyLin on 2016/9/5.
 */

'use strict';

var _ = require('lodash');
var ParamProviderError = require('./../errors/ParamProviderError.js');
var DBOptionError = require('./../errors/DBOptionError.js');
var ProjectSchema = require('./../modules/project-schema.js');
var ProjectStaticSchema = require('./../modules/project-static-schema.js');

/**
 * 
 * 
 * @param {any} server
 * @param {any} BASEPATH
 */
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
        path: BASEPATH + '/project/projectlist',
        version: '0.0.1'
    }, getList);

    server.get({
        path: BASEPATH + '/project',
        version: '0.0.1'
    }, _getProjectByID);

    /**
     * 创建新项目
     * POST /project
     * body 参考 ProjectSchema
     */
    server.post({
        path: BASEPATH + '/project'
    }, createProject);

    /**
     * 设置项目组成员的权限
     * POST /project/项目ID/项目成员账号/权限标识
     */
    server.post({
        path: BASEPATH + '/project/setauthority/:projectid'
    }, _setMemberAuthority);

    /**
     * 获取项目统计结果 
     */
    server.get({
        path: BASEPATH + '/project/static'
    }, _getProjectStatic);

    /**
     * 添加一个项目成员
     */
    server.post({
        path: BASEPATH + '/project/addmember/:projectid'
    }, _addMemberToProject);

    /**
     * 移除一个项目成员
     */
    server.post({
        path: BASEPATH + '/project/rmmember/:projectid'
    }, _rmMemberToProject);


};

function _rmMemberToProject(req, res, next) {
    var projectID = req.params.projectid;
    var member = req.body;

    ProjectSchema
        .where({
            _id: projectID
        })
        .update({
            $pull: {
                members: {
                    account: member.account
                },
                reviewers: {
                    account: member.account
                }
            }
        })
        .exec(function (err) {
            if (err) {
                return next(new DBOptionError(415, err));
            } else {
                res.end();
            }
        });

}

function _addMemberToProject(req, res, next) {
    var projectID = req.params.projectid;
    var member = req.body;

    ProjectSchema
        .where({
            _id: projectID
        })
        .update({
            $addToSet: {
                members: {
                    account: member.account,
                    name: member.name
                }
            }
        })
        .exec(function (err) {
            if (err) {
                return next(new DBOptionError(415, err));
            } else {
                res.end();
            }
        });
}

function _setMemberAuthority(req, res, next) {
    var projectID = req.params.projectid;
    var member = req.body;
    var authority = member.authority;

    ProjectSchema
        .find({
            "_id": projectID,
            "members.account": member.account
        })
        .exec(function (err, doc) {
            if (err) {
                return next(new DBOptionError(415, err));
            } else {
                if (doc.length > 0) {

                    var tmp = ProjectSchema.where({
                        _id: projectID
                    });

                    if (authority === "reviewer") {
                        tmp.update({                            
                            $addToSet: {
                                reviewers: {
                                    account: member.account,
                                    name: member.name
                                }
                            }
                        });
                    } else if (authority === "normal") {
                        tmp.update({
                            $pull: {
                                reviewers: {
                                    account: member.account
                                }
                            }
                        });
                    }
                    tmp.exec(function (err) {
                        if (err) {
                            return next(new DBOptionError(415, err));
                        } else {
                            res.end();
                        }
                    });
                }
            }
        });
}

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
    var account = req.params.account;
    ProjectSchema.find({
        'members.account': account
    }, function (err, doc) {
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

function _getProjectByID(req, res, next) {
    var id = req.params.id;
    ProjectSchema.find({
        _id: id
    }, function (err, doc) {
        if (err) {
            return next(err);
        }

        var result = {
            status: 'success',
            data: doc
        };

        res.end(JSON.stringify(result));
        return next();
    });
}

function _getProjectStatic(req, res, next) {
    var projectIDs = req.params.id;
    var startMonth = req.params.smonth;
    var endMonth = req.params.emonth;
    var conditions = {};
    if (startMonth !== undefined && endMonth !== undefined) {
        startMonth = Number(startMonth);
        endMonth = Number(endMonth);
        if (startMonth > endMonth) {
            var tmp = startMonth;
            startMonth = endMonth;
            endMonth = tmp;
        }
        conditions.month = {
            '$gte': startMonth,
            '$lte': endMonth
        };
    }
    var idList = projectIDs.split(' ');
    if (projectIDs.length > 0) {
        conditions.projectID = {
            $in: idList
        };
    }

    ProjectStaticSchema
        .find(conditions)
        .sort({ 'projectID': -1, 'month': -1 })
        .exec(function (err, doc) {
            var data = {};
            if (err) {
                data.status = 'error';
                data.error = err;
                data.doc = null;
            }
            data.status = 'success';
            data.doc = doc;
            res.end(JSON.stringify(data));
        });

}