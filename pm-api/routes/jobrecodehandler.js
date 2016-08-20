/**
 * Created by FanTaSyLin on 2016/8/17.
 */

module.exports = function () {

    var _ = require('lodash');
    var ProjectSchema = require('./../modules/project-schema.js');
    var JobLogSchema = require('./../modules/joblog-schema.js');
    var ParamProviderError = require('./../errors/ParamProviderError.js');
    var DBOptionError = require('./../errors/DBOptionError.js');

    var jobRecodeHandler = {
        insert: insert,
        update: update,
        find: find
    }

    function insert(req, res, next) {
        var projectID = req.params['projectid'];

        if (_.isNull(projectID)) {
            return next(new ParamProviderError(415, {
                message: 'Invalid params'
            }));
        }

        var jobLog = new JobLogSchema();
        try {
            jobLog.init(req.body);
            ProjectSchema.update({
                id: projectID
            }, {
                $push: {
                    'jobLogs': jobLog
                }
            }, function (err) {
                return next(new DBOptionError(415, err));
            });
        } catch (err) {
            return next(err)
        }
    }

    function update(req, res, next) {
        var projectID = req.params['projectid'];
        var jobLogID = req.params['joblogid'];
        if (_.isNull(projectID) || _.isNull(jobLogID)) {
            return next(new ParamProviderError(415, {
                message: 'Invalid params'
            }));
        }
        //TODO: 更新数据
    }

    function find(req, res, cb) {

    }

    return jobRecodeHandler;
}