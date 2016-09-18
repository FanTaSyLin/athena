/**
 * Created by FanTaSyLin on 2016/9/5.
 */

'use strict';

var _ = require('lodash');
var JobLogSchema = require('./../modules/joblog-schema.js');
var ParamProviderError = require('./../errors/ParamProviderError.js');
var DBOptionError = require('./../errors/DBOptionError.js');


module.exports = function (server, BASEPATH) {

    require('./../lib/shkutil.js');

    server.get({
        path: BASEPATH + '/jobrecode/datelist',
        version: '0.0.1'
    }, getDateList);

    server.post({
        path: BASEPATH + '/jobrecode',
        version: '0.0.1'
    }, submitRecode);

    server.get({
        path: BASEPATH + '/jobrecode/joblist',
        version: '0.0.1'
    }, getRecodes);

    server.get({
        path: BASEPATH + '/jobrecode/unauditedlist',
        version: '0.0.1'
    }, getUnauditeds);

};

function getDateList(req, res, next) {
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

function submitRecode(req, res, next) {

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

function getRecodes(req, res, next) {

    if (_.isUndefined(req.params)) {

        //由于数据量过大 所以应该禁止无条件查询
        return next(new ParamProviderError(415, {
            message: 'Invalid params'
        }));

    }

    var condition = {};

    if (!_.isUndefined(req.params['username'])) {
        //添加查询条件： ==username
        var username = req.params['username'];
        condition.authorID = username;
    }

    if (!_.isUndefined(req.params['projectid'])) {
        //添加查询条件： ==projectid
        var projectID = req.params['projectid'];
        condition.projectID == projectID;
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

    JobLogSchema.find(condition, function (err, doc) {

        if (err) {
            return next(new DBOptionError(415, err));
        }

        if (doc.length < 1) {
            res.end(JSON.stringify([new JobLogSchema()]));
        }

        res.end(JSON.stringify(doc));

    });

}

function getUnauditeds(req, res, next) {
    if (_.isUndefined(req.params)) {
        //由于数据量过大 所以应该禁止无条件查询
        return next(new ParamProviderError(415, {
            message: 'Invalid params'
        }));
    }
    var _id = req.params['projectid'];
    if (_.isUndefined(_id)) {
        return next(new ParamProviderError(415, {
            message: 'Invalid params, projectid == undefined'
        }));
    }
    JobLogSchema.find({
       projectID: _id,
       isChecked: false
    }, function (err, doc) {
        if (err) {
            return next(new DBOptionError(415, err));
        }
        if (doc.length < 1) {
            res.end(JSON.stringify([new JobLogSchema()]));
        }

        res.end(JSON.stringify(doc));
    })
}