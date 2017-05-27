/**
 * Created by fantasylin on 5/19/17.
 * 数据维护脚本
 * 1. 定时检查数据当天提交的工作记录，将连击产生的相同记录清除，只保留一条
 */

(function () {

    "use strict";

    var mongoose = require('mongoose');
    var moment = require('moment');
    var Timer = require('./../lib/timer.js').Timer;
    var JobSchema = require('./../modules/joblog-schema.js');
    var _timer = new Timer(1000 * 60 * 60 * 3);

    const MONGOOSE_URI = process.env.MONGOOSE_URI || "mongodb://shk401:68400145@123.56.135.196:6840/pmsoft";
    var opt_Mongoose = {
        server: {socketOptions: {keepAlive: 1, connectTimeoutMS: 30000}},
        replset: {socketOptions: {keepAlive: 1, connectTimeoutMS: 30000}}
    };
    mongoose.Promise = global.Promise;
    mongoose.connect(MONGOOSE_URI, opt_Mongoose);
    mongoose.connection.on('error', function () {
        console.error('Mongoose connection error: %s', err.stack);
    });
    mongoose.connection.on('open', function () {
        console.log('Mongoose connected to the PMSoft-Mongo');
        _timer.start();
        // _stripoutDuplicateRecords();
    });
    _timer.on('tick', function () {
        //  定时检查数据当天提交的工作记录，将连击产生的相同记录清除，只保留一条
        _stripoutDuplicateRecords();
    });

    /**
     * @description 清除重复记录
     * @private
     */
    function _stripoutDuplicateRecords() {
        // 获取当天所有提交的工作记录
        _getLogs(function (err, data) {
            //找出重复的记录并删除
            var tmpJogLogs = [];
            var noUniques = [];
            for (var i = 0; i < data.length; i++) {
                var isUnique = true;
                for (var j = 0; j < tmpJogLogs.length; j++) {
                    if (tmpJogLogs[j].authorID === data[i].authorID && tmpJogLogs[j].content === data[i].content && moment(tmpJogLogs[j].starTime).format('yyyy-MM-dd hh:mm:ss') === moment(data[i].starTime).format('yyyy-MM-dd hh:mm:ss')) {
                        isUnique = false;
                        console.log('发现重复记录: \r\n记录人：' + data[i].authorID + "\r\n开始时间：" + data[i].starTime + "\r\n内容：" + data[i].content + "\r\n");
                        noUniques.push(data[i]);
                        break;
                    }
                }
                if (isUnique) {
                    tmpJogLogs.push(data[i]);
                }
            }
            noUniques.forEach(function (item) {
                JobSchema.remove({
                    _id: item._id
                }, function (err) {
                    if (err) {
                        console.log("删除重复记录： " + err.message);
                    }
                });
            });
        });
    }

    function _getLogs(next) {
        var dateStr = new Date().toISOString().substring(0, 10);
        JobSchema
            .find({
                // date: new Date(dateStr)
                // date: new Date('2017-05-02')
            })
            .sort({
                date: -1
            })
            .skip(0)
            .limit(200)
            .exec(function (err, doc) {
                next(err, doc);
            });
    }

})();


