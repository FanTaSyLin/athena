/**
 * Created by FanTaSyLin on 2016/8/18.
 */

var mongoose = require('mongoose');
var _ = require('lodash');
var DataVerifyError = require('./../errors/DataVerifyError.js');
var Schema = mongoose.Schema;

/**
 * 工作记录 module
 * 其中
 * id duration isChecked reportTime reviewerTime为系统自动处理
 * [authorID] [authorName] authorAvatar [startTime] [endTime] [type] [content] [projectID] [projectCName] [projectEName]提交工作记录时填写
 * factor reviewerID reviewerName  reviewerAvatar审核时填写
 *
 * @type {"mongoose".mongoose.Schema|"mongoose"._mongoose.Schema}
 */
var JobLogSchema = new Schema({
    authorID: {type: String}, /*记录人ID，查询*/
    authorName: {type: String}, /*记录人姓名，显示*/
    authorAvatar: {type: String}, /*记录人头像，显示*/
    reportTime: {type: Date}, /*记录时间，查询，显示*/
    date: {type: Date}, /*工作记录的日期，查询，显示*/
    starTime: {type: Date}, /*工作开始时间，查询，显示*/
    endTime: {type: Date}, /*工作结束时间，查询，显示*/
    type: {type: String}, /*工作类型，查询，显示*/
    content: {type: String}, /*工作内容，显示*/
    duration: {type: Number}, /*工作量，统计*/
    projectID: {type: String}, /*项目ID, 查询 统计*/
    projectCName: {type: String}, /*项目名称, 显示*/
    projectEName: {type: String}, /*项目名称, 显示*/
    title: {type: String}, /*工作记录的简化描述，显示*/

    reviewerID: {type: String}, /*审核人ID，查询*/
    reviewerName: {type: String}, /*审核人姓名，显示*/
    reviewerAvatar: {type: String}, /*审核人头像，显示*/
    reviewerTime: {type: Date}, /*审核时间，记录 查询 统计*/

    //以下内容为新增内容 2016/10/08
    difficulty: {type: Number}, /*难度系数*/
    efficiency: {type: Number}, /*效率系数*/
    quality: {type: Number}, /*质量系数*/
    factor: {type: Number}, /*总体评定系数 通过 难度系数、效率系数、质量系数相乘得到*/
    status: {type: String}, /*该记录的当前状态 分为 Submit-提交 Decline-拒绝 Pass-审核通过*/
    logs: [{
        type: {type: String}, /*日志类型 New-新建 Add-添加内容等 Edit-编辑了内容 Change-修改了状态*/
        logTime: {type: Date}, /*日志时间戳*/
        msg: {type: String}, /*日志内容*/
        authorID: {type: String}, /*编辑人账户*/
        authorName: {type: String} /*编辑人姓名*/
    }]
});

JobLogSchema.methods.reportInit = function (body) {
    var self = this;

    if (!reportVerify(body)) {
        throw new DataVerifyError("415", {
            message: 'Invalid JobLog body'
        });
    }

    try {
        self.authorID = body.authorID;
        self.authorName = body.authorName;
        self.authorAvatar = body.authorAvatar || ''; //默认值
        self.authorDepartment = body.authorDepartment;
        self.reportTime = new Date();
        self.date = new Date(body.date);
        self.starTime = new Date(body.startTime);
        self.endTime = new Date(body.endTime);
        self.type = body.type;
        self.content = body.content;
        self.projectID = body.projectID;
        self.projectCName = body.projectCName;
        self.projectEName = body.projectEName;
        self.duration = (Math.abs(self.endTime - self.starTime) / (1000 * 60 * 60)).toFixed(1);
        self.reviewerID = '';
        self.reviewerName = '';
        self.reviewerAvatar = '';
        self.reviewerTime = new Date('1900-01-01 00:00:00');
        self.difficulty = 1;
        /*难度系数*/
        self.efficiency = 1;
        /*效率系数*/
        self.quality = 1;
        /*质量系数*/
        self.factor = 1;
        /*总体评定系数 通过 难度系数、效率系数、质量系数相乘得到*/
        self.status = 'Submit';
        /*该记录的当前状态 分为 Submit-提交 TurnBack-退回 Pass-审核通过*/
        self.logs.push({
            type: 'New',
            logTime: new Date(),
            msg: '添加了本条记录',
            authorID: body.authorID,
            authorName: body.authorName
        });
    } catch (err) {
        throw new DataVerifyError("415", err);
    }
}

JobLogSchema.methods.reviewVerify = function (body) {
    if (_.isUndefined(body)) {
        return false;
    }

    if (_.isUndefined(body.reviewerID) ||
        _.isUndefined(body.reviewerName) ||
        _.isUndefined(body.difficulty) ||
        _.isUndefined(body.efficiency) ||
        _.isUndefined(body.quality)
    ) {
        return false;
    } else {
        return true;
    }
}

module.exports = mongoose.model('JobLog', JobLogSchema);

function reportVerify(body) {
    if (_.isNull(body) || _.isUndefined(body)) {
        return false;
    }

    if (_.isUndefined(body.authorID) ||
        _.isUndefined(body.authorName) ||
        _.isUndefined(body.authorDepartment) ||
        _.isUndefined(body.startTime) ||
        _.isUndefined(body.endTime) ||
        _.isUndefined(body.projectID) ||
        _.isUndefined(body.projectCName) ||
        _.isUndefined(body.projectEName) ||
        _.isUndefined(body.type) ||
        _.isUndefined(body.content)
    ) {
        return false;
    } else {
        return true;
    }

}