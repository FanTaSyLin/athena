/**
 * Created by FanTaSyLin on 2016/9/5.
 */
(function () {

    "use strict";

    var _ = require('lodash');
    var JobLogSchema = require('./../modules/joblog-schema.js');
    var ParamProviderError = require('./../errors/ParamProviderError.js');
    var DBOptionError = require('./../errors/DBOptionError.js');


    module.exports = function (server, BASEPATH) {

        require('./../lib/shkutil.js');

        server.get({
            path: BASEPATH + '/jobrecode/datelist',
            version: '0.0.1'
        }, _getDateList);

        server.post({
            path: BASEPATH + '/jobrecode/submit',
            version: '0.0.1'
        }, _submitRecode);

        server.get({
            path: BASEPATH + '/jobrecode/joblist',
            version: '0.0.1'
        }, _getRecodes); //获取工作记录

        server.get({
            path: BASEPATH + '/jobrecode/joblist/count',
            version: '0.0.1'
        }, _getRecodesCount); //获取工作记录的分页信息

        server.get({
            path: BASEPATH + '/jobrecode/joblist/pagination',
            version: '0.0.1'
        }, _getRecodesPagination); //获取工作记录,分页查询

        server.get({
            path: BASEPATH + '/jobrecode/unauditedlist',
            version: '0.0.1'
        }, _getUnauditedList);//获取未审核工作记录

        server.get({
            path: BASEPATH + '/jobrecode/unauditedlist-count',
            version: '0.0.1'
        }, _getUnauditedsCount);//获取未审核工作记录统计信息

        server.post({
            path: BASEPATH + '/jobrecode/check',
            version: '0.0.1'
        }, _checkJob);//审核工作记录

        server.post({path: BASEPATH + '/jobrecode/turnback',
            version: '0.0.1'}, _turnBackJob);//退回已提交的工作记录

    }

    function _getDateList(req, res, next) {
        var now = new Date();
        var dateList = [];
        dateList.push(now);
        dateList.push(now.addDay(-1));
        dateList.push(now.addDay(-2));
        dateList.push(now.addDay(-3));
        dateList.push(now.addDay(-4));
        dateList.push(now.addDay(-5));
        res.end(JSON.stringify(dateList));
        return next();
    }

    function _submitRecode(req, res, next) {

        if (_.isUndefined(req.body)) {
            return next(new ParamProviderError(415, {
                message: 'Invalid params'
            }));
        }

        var body = req.body;

        try {

            var recodeSchema = new JobLogSchema();

            recodeSchema.reportInit(body);

            recodeSchema.save(function (err) {

                if (err) {
                    return next(new DBOptionError(415, err));
                } else {
                    res.end();
                }

            });

        } catch (err) {

            return next(err);

        }

    }

    function _getRecodes(req, res, next) {

        if (_.isUndefined(req.params)) {

            //由于数据量过大 所以应该禁止无条件查询
            return next(new ParamProviderError(415, {
                message: 'Invalid params'
            }));

        }

        var condition = {};
        var accountList = req.params['memberid'];
        var projectList = req.params['projectid'];

        if (!_.isUndefined(accountList)) {
            //添加查询条件： ==username
            accountList = accountList.split(' ');
            condition.authorID = {
                $in: accountList
            };
        }

        if (!_.isUndefined(projectList)) {
            //添加查询条件： ==projectid
            projectList = projectList.split(' ');
            condition.projectID = {
                $in: projectList
            };;
        }

        if (!_.isUndefined(req.params['startdate']) && !_.isUndefined(req.params['enddate'])) {
            //添加查询条件： >=startdate
            var startDate = new Date(req.params['startdate']);
            var endDate = new Date(req.params['enddate']);
            condition.date = {
                $gte: startDate,
                $lte: endDate
            }
        }

        JobLogSchema.find(condition).sort({'data': 1, 'starTime': 1}).exec(function (err, doc) {

            if (err) {
                return next(new DBOptionError(415, err));
            }

            if (doc.length < 1) {
                res.end(JSON.stringify([new JobLogSchema()]));
            }

            res.end(JSON.stringify(doc));

        });

    }

    /**
     * 分页查询工作记录
     * @param req
     * @param res
     * @param next
     * @private
     */
    function _getRecodesPagination(req, res, next) {

        if (_.isUndefined(req.params)) {

            //由于数据量过大 所以应该禁止无条件查询
            return next(new ParamProviderError(415, {
                message: 'Invalid params'
            }));

        }

        var condition = {};
        var accountList = req.params['memberid'];
        var projectList = req.params['projectid'];
        var startNum = req.params['startnum'];
        var pageSize = req.params['pagesize'];

        if (!_.isUndefined(accountList)) {
            //添加查询条件： ==username
            accountList = accountList.split(' ');
            condition.authorID = {
                $in: accountList
            };
        }

        if (!_.isUndefined(projectList)) {
            //添加查询条件： ==projectid
            projectList = projectList.split(' ');
            condition.projectID = {
                $in: projectList
            };;
        }

        if (!_.isUndefined(req.params['startdate']) && !_.isUndefined(req.params['enddate'])) {
            //添加查询条件： >=startdate
            var startDate = new Date(req.params['startdate']);
            var endDate = new Date(req.params['enddate']);
            condition.date = {
                $gte: startDate,
                $lte: endDate
            }
        }

        JobLogSchema
            .find(condition)
            .skip(startNum-1)
            .limit(pageSize)
            .sort({'data': 1, 'starTime': 1})
            .exec(function (err, doc) {

            if (err) {
                return next(new DBOptionError(415, err));
            }

            var data = {
                count: doc.length,
                doc: doc
            }

            res.end(JSON.stringify(data));

        });
    }

    /**
     * 获取未审核数据列表
     * @param req
     * @param res
     * @param next
     * @returns {*}
     */
    function _getUnauditedList(req, res, next) {
        if (_.isUndefined(req.params)) {
            //由于数据量过大 所以应该禁止无条件查询
            return next(new ParamProviderError(415, {
                message: 'Invalid params'
            }));
        }
        var _idList = req.params['projectid'];

        var memberID = req.params['memberid'];
        if (_.isUndefined(_idList)) {
            return next(new ParamProviderError(415, {
                message: 'Invalid params, projectid == undefined'
            }));
        }
        _idList = _idList.split(' ');

        var condition = {};
        condition.status = 'Submit';
        condition.projectID = {
            $in: _idList
        };
        if (!_.isUndefined(memberID)) {
            condition.authorID = memberID;
        }

        JobLogSchema
            .find(condition)
            .limit(100)
            .exec(function (err, doc) {
                if (err) {
                    return next(new DBOptionError(415, err));
                }
                var data = {
                    count: doc.length,
                    doc: doc
                }

                res.end(JSON.stringify(data));
            })
    }

    /**
     * 审核工作日志
     * @param req
     * @param res
     * @param next
     */
    function _checkJob(req, res, next) {
        if (_.isUndefined(req.body)) {
            return next(new ParamProviderError(415, {
                message: 'Invalid params'
            }));
        }
        var body = req.body;
        try {
            var recodeSchema = new JobLogSchema();
            if (recodeSchema.reviewVerify(body)) {
                JobLogSchema.update({
                    _id: body._id
                }, {
                    $set: {
                        reviewerName: body.reviewerName,
                        reviewerID: body.reviewerID,
                        reviewerTime: new Date(),
                        difficulty: body.difficulty,
                        efficiency: body.efficiency,
                        quality: body.quality,
                        factor: (body.difficulty * body.efficiency * body.quality).toFixed(2),
                        status: 'Pass'
                    },
                    $push: {
                        logs:{
                            type: 'Change', /*日志类型 New-新建 Add-添加内容等 Edit-编辑了内容 Change-修改了状态*/
                            logTime: new Date(), /*日志时间戳*/
                            msg: '审核了本条记录。', /*日志内容*/
                            authorID: body.reviewerID, /*编辑人账户*/
                            authorName: body.reviewerName /*编辑人姓名*/
                        }
                    }
                }, function (err) {
                    if (err) {
                        return next(new DBOptionError(415, err));
                    } else {
                        res.end();
                    }
                })
            }
        } catch (err) {
            return next(err);
        }

    }

    /**
     * TODO：获取未审核数据的统计信息，包括：未审核数据总数，分项目总数， 分项目人员列表
     */
    function _getUnauditedsCount(req, res, next) {
        if (_.isUndefined(req.params)) {
            //由于数据量过大 所以应该禁止无条件查询
            return next(new ParamProviderError(415, {
                message: 'Invalid params'
            }));
        }
        var _idList = req.params['projectid'];
        var memberID = req.params['memberid'];
        if (_.isUndefined(_idList)) {
            return next(new ParamProviderError(415, {
                message: 'Invalid params, projectid == undefined'
            }));
        }
        _idList = _idList.split(' ');

        var condition = {};
        condition.isChecked = false;
        condition.projectID = {
            $in: _idList
        };
        if (!_.isUndefined(memberID)) {
            condition.authorID = memberID;
        }

        JobLogSchema.find(condition, function (err, doc) {
            if (err) {
                return next(new DBOptionError(415, err));
            }
            var data = {
                count: doc.length
            };

            res.end(JSON.stringify(data));
        });
    }

    /**
     * 退回已提交的工作记录
     * @param req
     * @param res
     * @param next
     * @private
     */
    function _turnBackJob(req, res, next) {
        if (_.isUndefined(req.body)) {
            return next(new ParamProviderError(415, {
                message: 'Invalid params'
            }));
        }

        var body = req.body;

        try {
            JobLogSchema.update({
                _id: body._id
            }, {
                $set: {
                    status: 'TurnBack'
                },
                $push: {
                    logs:{
                        type: 'Change', /*日志类型 New-新建 Add-添加内容等 Edit-编辑了内容 Change-修改了状态*/
                        logTime: new Date(), /*日志时间戳*/
                        msg: '退回了本条记录。原因：' + body.turnBackReason + '。', /*日志内容*/
                        authorID: body.reviewerID, /*编辑人账户*/
                        authorName: body.reviewerName /*编辑人姓名*/
                    }
                }
            }, function (err) {
                if (err) {
                    return next(new DBOptionError(415, err));
                } else {
                    res.end();
                }
            })
        } catch (err) {
            return next(err);
        }

    }

    /**
     * 获取工作记录的分页信息
     * @param req
     * @param res
     * @param next
     * @private
     */
    function _getRecodesCount(req, res, next) {
        if (_.isUndefined(req.params)) {

            //由于数据量过大 所以应该禁止无条件查询
            return next(new ParamProviderError(415, {
                message: 'Invalid params'
            }));

        }

        var condition = {};
        var accountList = req.params['memberid'];
        var projectList = req.params['projectid'];

        if (!_.isUndefined(accountList)) {
            //添加查询条件： ==username
            accountList = accountList.split(' ');
            condition.authorID = {
                $in: accountList
            };
        }

        if (!_.isUndefined(projectList)) {
            //添加查询条件： ==projectid
            projectList = projectList.split(' ');
            condition.projectID = {
                $in: projectList
            };;
        }

        if (!_.isUndefined(req.params['startdate']) && !_.isUndefined(req.params['enddate'])) {
            //添加查询条件： >=startdate
            var startDate = new Date(req.params['startdate']);
            var endDate = new Date(req.params['enddate']);
            condition.date = {
                $gte: startDate,
                $lte: endDate
            }
        }

        JobLogSchema.count(condition, function (err, doc) {
            if (err) {
                return next(new DBOptionError(415, err));
            }
            var data = {
                count: doc
            };
            res.end(JSON.stringify(data));
        });

    }
})();