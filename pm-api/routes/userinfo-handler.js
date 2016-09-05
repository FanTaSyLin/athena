/**
 * Created by FanTaSyLin on 2016/9/5.
 */

'use strict';

var _ = require('lodash');
var EmployeeSchema = require('./../modules/employee-schema.js');
var ParamProviderError = require('./../errors/ParamProviderError.js');
var DBOptionError = require('./../errors/DBOptionError.js');

module.exports = function (server, BASEPATH) {

    server.post({
        path: BASEPATH + '/userinfo',
        version: '0.0.1'
    }, createUser);

    server.get({
        path: BASEPATH + '/employee',
        version: '0.0.1'
    }, getEmployee);

};

function createUser(req, res, next) {
    if (_.isUndefined(req.body)) {
        return next(new ParamProviderError(415, {
            message: 'Invalid params'
        }));
    }
    var body = req.body;
    var employee = new EmployeeSchema();
    try {
        employee.initData(body);
        employee.save(function (err) {
            if (err) {
                res.send(500, err);
            } else {
                res.end();
            }
        });

    } catch (err) {
        next(err);
    }
}

function getEmployee(req, res, next) {
    var name = req.params['name'];
    var account = req.params['account'];
    EmployeeSchema.find({
        $or: [
            {name: name},
            {account: account}
        ]
    }, function (err, docs) {
        if (err) {
            return next(new DBOptionError(415, err));
        }
        var employee = {};
        var employees = [];

        if (!docs) {
            res.end(JSON.stringify(employee))
        } else {
            docs.forEach(function (doc) {
                employee = {};
                employee.account = doc.account;
                employee.name = doc.name;
                employee.avatar = doc.avatar;
                employee.department = doc.department;
                employee.mobile = doc.mobile;
                employee.officeTel = doc.officeTel;
                employee.projects = doc.projects;
                employees.push(employee);
            });

            res.end(JSON.stringify(employees));
        }
    });
}