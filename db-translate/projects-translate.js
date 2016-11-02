/**
 * Created by FanTaSyLin on 2016/10/31.
 */

(function () {

    'use strict';

    var mssql = require('mssql');
    var http = require('http');

    var projectList = [];
    var memberList = [];


    mssql.connect("mssql://sa:shk218@10.24.43.63/PM").then(function () {
        var req = new mssql.Request();

        //获取项目数据
        _getProjectInfoConfig(req, function (err) {
            if (err) return console.error('获取项目数据失败，' + err.message);
            //获取项目成员数据
            _getProjectMembers(req, function (err) {
                if (err) return console.error('获取项目成员数据，' + err.message);
                //组合数据 创建projectSchema
                _submit();
            });
        });

    });

    function _submit() {
        if (projectList.length === 0) {
            return;
        }
        var item = projectList.shift();
        _submitSingle(item, function () {
            _submit();
        })
    }

    function _submitSingle(item, cb) {
        var schema = {};
        schema.isClosed = item.IsValid;
        schema.about = (item.Description.length < 2) ? '' : item.Description;
        schema.type = '工程';
        schema.createTime = _getTimeByCode(item.Code);
        schema.enName = item.EngName;
        schema.cnName = item.ChnName;
        schema.members = _getMembers(item.Code);
        schema.reviewers = _getReviewers(item.Code);
        if (schema.reviewers.length > 0) {
            schema.authorID = schema.reviewers[0].account;
            schema.authorName = schema.reviewers[0].name;
        }

        //var data = queryString.stringify(schema);

        var options = {
            hostname: '123.56.135.196',
            port: 4003,
            path: '/api/project',
            method: 'POST',
            rejectUnauthorized: false,
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            }
        };

        var req = http.request(options, function(res){
            /*res.setEncoding('uft8');
            res.on('end', function(){
                //cb();
            });
            res.on('error', function (e) {
                console.log('problem with request: ' + e.message);
            })*/
            if (res.statusCode === 200) {
                cb();
            }
        });

        req.end(JSON.stringify(schema));
    }

    function _getMembers(code) {
        var list = [];
        memberList.forEach(function (item) {
            if (item.Account !== null && item.ProjectID === code) {
                list.push({
                    account: item.Account,
                    name: item.Name
                });
            }
        });
        return list;
    }

    function _getReviewers(code) {
        var list = [];
        memberList.forEach(function (item) {
            if (item.Account !== null && item.ProjectID === code && item.IsTeamLeader === 1) {
                list.push({
                    account: item.Account,
                    name: item.Name
                });
            }
        });
        return list;
    }

    function _getTimeByCode(str) {
        return new Date(str.substring(0,4)
            + '-' + str.substring(4,2)
            + '-' + str.substring(6,2)
            + ' ' + str.substring(8,2)
            + ':' + str.substring(10,2)
            + ':' + str.substring(12,2));
    }

    function _getProjectInfoConfig(req, cb) {
        projectList = [];
        req.query('select * from ProjectInfoConfig').then(function (recordset) {
            recordset.forEach(function (item) {
                projectList.push(item);
            });
            cb(null);
        }).catch(function (err) {
            cb(err);
        });
    }

    function _getProjectMembers(req, cb) {
        var strSQL = "select m.Account as Account, m.ProjectID as ProjectID, m.IsTeamLeader as IsTeamLeader, replace(u.name,' ','') as Name from ProjectMemberConfig m left join UserInfo u on m.Account = u.Account;"
        memberList = [];
        req.query(strSQL).then(function (recordset) {
            recordset.forEach(function (item) {
                memberList.push(item);
            });
            cb(null);
        }).catch(function (err) {
            cb(err);
        })
    }

})();