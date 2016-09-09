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