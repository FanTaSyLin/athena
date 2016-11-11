/**
 * Created by FanTaSyLin on 2016/11/7
 * 
 * 
 * 自动审核脚本
 * 提交14天以后的工作记录 将自动被系统审核
 */

(function () {

    'use strict';

    var shkutil = require('./../lib/shkutil.js');
    var Timer = require('./../lib/timer.js').Timer;
    var mongoose = require('mongoose');
    var JobSchema = require('./../modules/joblog-schema.js');

    const MAXTIMELINE = (14 * 24 * 60 * 60 * 1000);
    const MONGOOSE_URI = process.env.MONGOOSE_URI || "123.56.135.196/pmsoft";
    var timer = new Timer(1000);
    var opt_Mongoose = {
        server: {
            auto_reconnect: true,
            poolSize: 100
        }
    };

    mongoose.Promise = global.Promise;
    mongoose.connect(MONGOOSE_URI, opt_Mongoose);
    mongoose.connection.on('error', function (err) {
        console.error('Mongoose connection error: %s', err.stack);
    });
    mongoose.connection.on('open', function () {
        console.log('Mongoose connected to the PMSoft-Mongo');
        timer.start();
    });

    timer.on('tick', function () {

        if (new Date().format('hh:mm:ss') !== '03:00:00') return;

        //获取未审核工作记录列表
        _getUnauditedJobList(function (err, docList) {

            _autoCheckedJob(docList, function () {

            });
            docList.forEach(function (doc) {

            });
        });

    });

    /**
     * 自动审核工作记录 
     * @param {any} docList
     * @param {any} cb
     */
    function _autoCheckedJob(docList, cb) {
        if (docList.length === 0) {
            return cb();
        }

        var doc = docList.shift();

        JobSchema.update({
            _id: doc._id
        }, {
                $set: {
                    reviewerName: '自动审核',
                    reviewerID: 'AutoChecked',
                    reviewerTime: new Date(),
                    difficulty: 1,
                    efficiency: 1,
                    quality: 1,
                    factor: 1,
                    status: 'Pass'
                },
                $push: {
                    logs: {
                        type: 'Change', /*日志类型 New-新建 Add-添加内容等 Edit-编辑了内容 Change-修改了状态*/
                        logTime: new Date(), /*日志时间戳*/
                        msg: '审核了本条记录。', /*日志内容*/
                        authorID: 'AutoChecked', /*编辑人账户*/
                        authorName: '自动审核' /*编辑人姓名*/
                    }
                }
            }, function (err) {
                console.error(err.stack);
                _autoCheckedJob(docList);
            });

    }

    /**
     * 获取未审核工作记录列表
     * @param {Function} cb
     * @param {Error} cb.err
     */
    function _getUnauditedJobList(cb) {
        JobSchema.find({
            'status': 'Submit',
            'date': {
                '$lte': new Date(new Date().getTime() - MAXTIMELINE)
            }
        }).exec(function (err, doc) {
            if (err) return cb(err, null);
            return cb(null, doc);
        });
    }

})();