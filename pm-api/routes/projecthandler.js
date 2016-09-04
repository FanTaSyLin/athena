/**
 * Created by FanTaSyLin on 2016/8/19.
 */

module.exports = function () {

    'use strict';

    var _ = require('lodash');
    var ParamProviderError = require('./../errors/ParamProviderError.js');
    var DBOptionError = require('./../errors/DBOptionError.js');
    var ProjectSchema = require('./../modules/project-schema.js');

    var projectHandler = {
        create: createNewProject,
        update: updateProjectInfo,
        addMembers: addMembers,
        rmMembers: rmMembers,
        addReviewers: addReviewers,
        rmReviewers: rmReviewers
    }

    return projectHandler;

    function createNewProject(req, res, next) {
        if (_.isUndefined(req.body)) {
            return next(new ParamProviderError(415, {
                message: 'Invalid params'
            }));
        }

        var project = new ProjectSchema();
        var body = req.body;
        try {
            project.init(body);
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

    function updateProjectInfo(req, res, next) {

    }

    function addMembers(req, res, next) {

    }

    function rmMembers(req, res, next) {

    }

    function addReviewers(req, res, next) {

    }

    function rmReviewers(req, res, next) {

    }
}