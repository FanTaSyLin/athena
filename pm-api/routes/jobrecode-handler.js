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

};

function getDateList(req, res, next) {
    var now = new Date();
    var dateList = [];
    dateList.push(now.addDay(1));
    dateList.push(now);
    dateList.push(now.addDay(-1));
    dateList.push(now.addDay(-2));
    dateList.push(now.addDay(-3));
    dateList.push(now.addDay(-4));
    dateList.push(now.addDay(-5));
    res.end(JSON.stringify(dateList));
    return next();
}