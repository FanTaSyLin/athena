/**
 * Created by FanTaSyLin on 2016/8/19.
 */

'use strict'

var mongoose = require('mongoose');
var _ = require('lodash');
var DataVerifyError = require('./../errors/DataVerifyError.js');
var Schema = mongoose.Schema;

var EmployeeSchema = new Schema({
    /*账户*/
    account: {type: String},
    /*姓名*/
    name: {type: String},
    /*头像*/
    avatar: {type: String},
    /*部门*/
    department: {type: String},
    /*权限*/
    authority: {type: [Boolean]},
    /*手机*/
    mobile: {type: String},
    /*座机*/
    officeTel: {type: String},
    /*参与的项目*/
    projects: [{
        id: {type: String},
        cnName: {type: String},
        enName: {type: String},
        authorName: {type: String},
    }]
});

EmployeeSchema.methods.init = function (body) {

    if (!verify(body)) {
        throw new DataVerifyError("415", {
            message: 'Invalid userInfo body'
        });
    }

    try {
        this.account = body.account;
        this.name = body.name;
        this.avatar = body.avatar || '';
        this.department = body.departmentId;
        this.authority = body.authority;
        this.mobile = body.mobile || '';
        this.officeTel = body.officeTel || '';
        this.projects = [];
    } catch (err) {
        throw new DataVerifyError("415", err);
    }
}

module.exports = mongoose.model('Employee', EmployeeSchema);

function verify(body) {
    if (_.isUndefined(body)
        || _.isUndefined(body.account)
        || _.isUndefined(body.name)
        || _.isUndefined(body.departmentId)
    ) {
        return false;
    } else {
        return true;
    }

}