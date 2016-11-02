/**
 * Created by FanTaSyLin on 2016/11/1.
 */

(function () {

    'use strict';

    var mssql = require('mssql');
    var http = require('http');
    var request = require('request');

    require('./shkutil.js');

    var jobList = [];
    var projectList = [];

    mssql.connect("mssql://sa:shk218@10.24.43.63/PM").then(function () {

        var req = new mssql.Request();

        //从mongoDB中获取项目列表
        request('http://123.56.135.196:4003/api/project/projectlist', function (err, res, body) {
            if (err) return console.error('获取工作记录失败，' + err.message);
            var list = JSON.parse(body);
            list.forEach(function (item) {
                projectList.push(item);
            });

            //获取工作记录
            _getJobList(req, function (err) {
                if (err) return console.error('获取工作记录失败，' + err.message);
                //将mongoDB中的项目ID与sql中的项目ID进行关联
                jobList.forEach(function (item) {
                    for (var i = 0; i < projectList.length; i++) {
                        if (projectList[i].enName === item.EngName && projectList[i].cnName === item.ChnName) {
                            item.mongoID = projectList[i]._id;
                        }
                    }
                });
                _submit();
            });
        });
    });


    function _submit() {
        if (jobList.length === 0) {
            return;
        }
        var item = jobList.shift();
        var recodeSchema = {};
        recodeSchema.authorID = item.UserID;
        recodeSchema.authorName = item.Name;
        recodeSchema.authorAvatar = '';
        recodeSchema.authorDepartment = item.Department;
        recodeSchema.reportTime = new Date();
        recodeSchema.date = item.Date;
        recodeSchema.starTime = item.BeginDate;
        recodeSchema.endTime = item.EndDate;
        recodeSchema.type = '技术';
        recodeSchema.content = item.WorkContent;
        recodeSchema.duration = item.SpendHours;
        recodeSchema.projectID = item.mongoID;
        recodeSchema.projectCName = item.ChnName;
        recodeSchema.projectEName = item.EngName;
        recodeSchema.title = '';


        if (item.IsChecked === 1) {
            //审核过的
            recodeSchema.reviewerID = item.CheckedManID;
            recodeSchema.reviewerName = item.CheckedManName;
            recodeSchema.reviewerAvatar = '';
            recodeSchema.reviewerTime = new Date();
            recodeSchema.difficulty = item.Difficulty || 1;
            recodeSchema.efficiency = item.Efficiency || 1;
            recodeSchema.quality = item.Quality || 1;
            recodeSchema.factor = item.Factor;
            recodeSchema.status = 'Pass';
            recodeSchema.logs = [];
            recodeSchema.logs.push({
                type: 'New',
                logTime: new Date(),
                msg: '导入了此记录',
                authorID: 'FanTaSyLin',
                authorName: '范霖'
            })
        } else {
            //未审核的
            recodeSchema.reviewerID = '';
            recodeSchema.reviewerName = '';
            recodeSchema.reviewerAvatar = '';
            recodeSchema.reviewerTime = new Date('1900-01-01 00:00:00');
            recodeSchema.difficulty = 1;
            recodeSchema.efficiency = 1;
            recodeSchema.quality = 1;
            recodeSchema.factor = 1;
            recodeSchema.status = 'Submit';
            recodeSchema.logs = [];
            recodeSchema.logs.push({
                type: 'New',
                logTime: new Date(),
                msg: '导入了此记录',
                authorID: 'FanTaSyLin',
                authorName: '范霖'
            });
        }

        request({
            url: 'http://123.56.135.196:4003/api/jobrecode/translate',
            method: "POST",
            json: true,
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify(recodeSchema)
        }, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                _submit();
            }
        });
    }

    function _getJobList(req, cb) {
        jobList = [];
        var strSQL = "\
        select \
            w.UserID as UserID, \
            replace(u.Name,' ','') as Name, \
            u.DeptCode as Department, \
            w.BeginDate as Date, \
            w.BeginDate as BeginDate, \
            w.EndDate as EndDate, \
            w.WorkContent as WorkContent, \
            w.SpendHours as SpendHours, \
            p.ChnName as ChnName, \
            p.EngName as EngName, \
            w.CheckedMan as CheckedManID, \
            replace(x.Name,' ','') as CheckedManName, \
            w.EffictFactorTime as Efficiency, \
            w.EffictFactorDifficulty as Difficulty, \
            w.EffictFactorSatisfaction as Quality, \
            w.Efficiency as Factor, \
            w.IsChecked as IsChecked \
        from WorkContents w \
            left join UserInfo u on w.UserID = u.Account \
            left join ProjectInfoConfig p on w.ProjectID = p.Code \
            left join UserInfo x on w.CheckedMan = x.Account;\
        "

        req.query(strSQL).then(function (recordset) {
            recordset.forEach(function (item) {
                jobList.push(item);
            });
            cb(null);
        }).catch(function (err) {
            cb(err);
        });
    };

})();