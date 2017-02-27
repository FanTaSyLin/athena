/**
 * Created by FanTaSyLin on 2016/11/7
 * 
 * 
 * 项目人天数是按月进行统计的，这样做的原因是便于按事件范围查询统计结果。
 * 因此不需要每次都获取出该想的所有工作记录进行计算。
 * 按照既定原则：
 * 1. 贡献度以审核后的标准工时统计；
 * 2. 只允许提交3日之内的工作记录；
 * 3. 已提交的工作记录7日之内必须审核；
 * 因此，为满足最大限度的统计覆盖率以及最小限度的计算量。每次统计只需要统计本月及上月的工作量即可。
 */


(function () {

    "use strict";

    require('./../lib/shkutil.js');

    const STANDARDHOUR = 8;

    var mongoose = require('mongoose');
    var _ = require('lodash');
    var moment = require('moment');
    var Timer = require('./../lib/timer.js').Timer;
    var ProjectSchema = require('./../modules/project-schema.js');
    var JobSchema = require('./../modules/joblog-schema.js');
    var ProjectStaticSchema = require('./../modules/project-static-schema.js');
    var index = 0;
    var timer = new Timer(1000 * 60 * 60 * 3);

    const MONGOOSE_URI = process.env.MONGOOSE_URI || "mongodb://shk401:68400145@123.56.135.196:6840/pmsoft";

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


        // if (new Date().format('hh:mm:ss') !== '03:00:00') return;
        index = 0;
        var y = new Date().getFullYear();
        var m = new Date().getMonth() + 1;
        var month1 = moment(new Date()).format("YYYYMM");
        var month2 = moment(new Date()).add('m', -1).format("YYYYMM");

        _getProjectList(function (err, data) {
            if (err) {
                console.error(err.stack);
            }
            var projectList1 = [];
            var projectList2 = [];
            data.forEach(function (item) {
                projectList1.push(item);
                projectList2.push(item);
            });

            //统计当月工作量
            _projectStaticByMonthMember(projectList1, month1);
            //统计上月工作量
            _projectStaticByMonthMember(projectList2, month2);

        });

    });

    /**
     * 根据月份 统计项目组成员的工作量 
     * @param {Array} projectList - 项目列表
     * @param {String} month - '201609'/'201610'.....
     */
    function _projectStaticByMonthMember(projectList, month) {
        _projectStatic(projectList, month, function () {

        });
    }

    /**
     * 根据projectList循环统计各个项目的工作量
     */
    function _projectStatic(projectList, month, cb) {
        if (projectList.length === 0) {
            return cb();
        }

        var projectItem = projectList.shift();


        //根据项目ID 获取相关工作记录列表
        _getJobListByProjectID(projectItem._id, month, function (err, data) {

            //TODO: 统计
            var projectStatic = _staticData(projectItem, month, data);

            //首先尝试删除原纪录
            _deleteProjectStaticResult(projectItem._id, month, function (err) {

                if (err) console.error(err.message);

                //重新提交新的记录结果 
                _submitProjectStaticResult(projectStatic, function (err) {
                    if (err) console.error(err.message);
                    _projectStatic(projectList, month, cb);
                });

            });

        });
    }


    /**
     * @description 统计
     * 
     * @param {Object} project - 
     * @param {String} month -'201609'/'201610' ......
     * @param {any} data
     * @returns {mongoose.Schema} result
     */
    function _staticData(project, month, data) {
        var schema = new ProjectStaticSchema();
        var joblog = {};
        var memberList = [];
        for (var i = 0; i < data.length; i++) {
            joblog = data[i];
            //如果 memberList 中存在此成员 则追加工作量
            //如果 memberList 不存在此成员 先创建再追加
            var isExist = false;
            for (var j = 0; j < memberList.length; j++) {
                if (memberList[j].account === joblog.authorID) {
                    memberList[j].duration_Checked += joblog.duration * joblog.factor;
                    memberList[j].duration_Real += joblog.duration;
                    isExist = true;
                    break;
                }
            }
            if (!isExist) {
                var item = {
                    account: joblog.authorID,
                    name: joblog.authorName,
                    duration_Checked: joblog.duration * joblog.factor,
                    duration_Real: joblog.duration
                };
                memberList.push(item);
            }

        }
        schema.projectID = project._id;
        schema.projectCName = project.cnName;
        schema.projectEName = project.enName;
        schema.month = month;
        schema.staticByMember = memberList;
        return schema;
    }

    /**
     * 删除记录。
     * @param {String} _id - 项目ID
     * @param {String} month - 统计的月份 表述方式：'201609' 
     * @param {Function} cb
     * @param {Error} cb.err
     */
    function _deleteProjectStaticResult(_id, month, cb) {
        ProjectStaticSchema.remove({
            'projectID': _id,
            'month': month
        }).exec(function (err, res) {
            if (err) return cb(err);
            cb(null);
        });
    }

    /**
     * 提交已生成的统计结果
     * @param {mongoose.Schema} project_static
     * @param {Function} cb
     * @param {Error} cb.err
     */
    function _submitProjectStaticResult(project_static, cb) {
        project_static.save(function (err) {
            if (err) return cb(err);
            return cb(null);
        });
    }

    /**
     * 根据ProjectID获取工作记录
     * @param {String} _id - ProjectID
     * @param {String} month - '201609'/'201610'.....
     * @param {Function} cb
     * @param {Error} cb.err
     * @param {Array} cb.doc
     */
    function _getJobListByProjectID(_id, month, cb) {
        var y = month.substring(0, 4);
        var m = month.substring(4, 6);
        var startDate = moment(month + '01');
        var endDate = moment(month + '01').endOf('month');
        JobSchema
            .find({
                'projectID': _id,
                'date': {
                    '$gte': startDate,
                    '$lte': endDate
                },
                'status': 'Pass'

            }, {
                'authorID': 1,
                'authorName': 1,
                'status': 1,
                'factor': 1,
                'quality': 1,
                'efficiency': 1,
                'difficulty': 1,
                'duration': 1,
                'date': 1
            })
            .exec(function (err, doc) {
                if (err) return cb(err, null);
                index++;
                console.log(index + '   项目ID：' + _id + '   统计月份：' + month + '   joblog数：' + doc.length);
                return cb(null, doc);
            });
    }

    /**
     * 获取项目列表
     * @param {Function} cb
     * @param {Error} cb.err 
     * @param {Array} cb.data
     */
    function _getProjectList(cb) {
        ProjectSchema.find({
            'isClosed': false
        }).exec(function (err, doc) {
            if (err) return cb(err, null);
            cb(null, doc);
        });
    }


})();