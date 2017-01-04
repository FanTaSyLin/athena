/**
 * Created by FanTaSyLin on 2017/1/4.
 */

var _ = require('lodash');
var ParamProviderError = require('./../errors/ParamProviderError.js');
var DBOptionError = require('./../errors/DBOptionError.js');
var ProjectStaticSchema = require('./../modules/project-static-schema.js');

module.exports = function (server, BASEPATH) {
    /**
     * 获取个人 项目中工作量统计结果,真实的非审核后的（包括：该项目的总工时，该账户在此项目中的总工时）
     */
    server.get({
        path: BASEPATH + '/static/psoneral/realworkdone/:account/:projectid',
        version: '0.0.1'
    }, _personalRealWorkDoneStatic);
};

function _personalRealWorkDoneStatic(req, res, next) {
    var projectIDs = req.params.projectid;
    var account = req.params.account;
    var idList = projectIDs.split(' ');
    var conditions = {};
    conditions["staticByMember.account"] = account;
    if (idList.length > 0) {
        conditions.projectID = {
            $in: idList
        };
    }
    ProjectStaticSchema
        .find(conditions)
        .exec(function (err, doc) {
            var data = {};
            if (err) {
                data.status = 'error';
                data.error = err;
                data.doc = null;
                res.end(JSON.stringify(data));
                return next(err);
            }
            var list = [];
            var staticObj = {
                projectID: '',
                totalWorkDone: 0,
                myWorkDone: 0
            };
            doc.forEach(function (item) {
                var staticByMemberList = item.staticByMember;
                staticObj.projectID = item.projectID;
                for (var i = 0; i < staticByMemberList.length; i++) {
                    if (staticByMemberList[i].account === account) {
                        staticObj.myWorkDone += staticByMemberList[i].duration_Real;
                        staticObj.totalWorkDone += staticByMemberList[i].duration_Real;
                    } else {
                        staticObj.totalWorkDone += staticByMemberList[i].duration_Real;
                    }
                }
                list.push(staticObj);
            });
            data.status = 'success';
            data.doc = list;
            res.end(JSON.stringify(data));
            return next();
        });
}