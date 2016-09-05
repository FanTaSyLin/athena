/**
 * Created by FanTaSyLin on 2016/8/18.
 */

var mongoose = require('mongoose');
var _ = require('lodash');
var DataVerifyError = require('./../errors/DataVerifyError.js');
var Schema = mongoose.Schema;

var ProjectSchema = new Schema({
    cnName: {type: String}, /*项目中文名 显示 查询 统计*/
    enName: {type: String}, /*项目英文名 显示 查询 统计*/
    createTime: {type: Date}, /*项目创建时间 保留*/
    authorID: {type: String}, /*创建者ID 保留*/
    authorName: {type: String}, /*创建者姓名 保留*/
    type: {type: String}, /*项目类型 统计*/
    about: {type: String}, /*项目简介 显示*/
    members: [{
        account: {type: String}, /*成员账号 查询*/
        name: {type: String} /*成员姓名 显示*/
    }],
    reviewers: [{
        account: {type: String}, /*成员账号 查询*/
        name: {type: String} /*成员姓名 显示*/
    }],
    isClosed: {type: Boolean} /*是否已关闭*/
});

ProjectSchema.methods.init = function (body) {
    var self = this;

    if (!verify(body)) {
        throw new DataVerifyError("415", {
            message: 'Invalid JobLog body'
        });
    }

    try {
        self.cnName = body.cnName;
        self.enName = body.enName;
        self.authorID = body.authorID;
        self.authorName = body.authorName;
        self.createTime = new Date();
        self.type = body.type || '自研';
        self.about = body.about;
        self.members = [];
        self.reviewers = [];
        self.isClosed = body.isClosed || false;
        body.members.forEach(function (item) {
            self.members.push({
                account: item.account,
                name: item.name
            });
        });
        body.reviewers.forEach(function (item) {
            self.reviewers.push({
                account: item.account,
                name: item.name
            });
        });
    } catch (err) {
        throw new DataVerifyError("415", err);
    }
}

module.exports = mongoose.model('Project', ProjectSchema);

function verify(body) {
    if (_.isNull(body) || _.isUndefined(body)) {
        return false;
    }
    if (
        _.isUndefined(body.cnName)
        || _.isUndefined(body.enName)
        || _.isUndefined(body.authorID)
        || _.isUndefined(body.authorName)
        || _.isUndefined(body.type)
        || _.isUndefined(body.members)
        || _.isEmpty(body.members)
        || _.isUndefined(body.reviewers)
        || _.isEmpty(body.reviewers)
    ) {
        return false;
    } else {
        return true;
    }
}