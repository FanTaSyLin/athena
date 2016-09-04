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
    starTime: {type: Date}, /*工作开始时间，查询，显示*/
    endTime: {type: Date}, /*工作结束时间，查询，显示*/
    type: {type: String}, /*工作类型，查询，显示*/
    content: {type: Buffer}, /*工作内容，显示*/
    duration: {type: Number}, /*工作量，统计*/
    projectID: {type: String}, /*项目ID, 查询 统计*/
    projectCName: {type: String}, /*项目名称, 显示*/
    projectEName: {type: String}, /*项目名称, 显示*/

    factor: {type: Number}, /*工作量系数，统计*/
    isChecked: {type: Boolean}, /*审核标识，查询，统计*/
    reviewerID: {type: String}, /*审核人ID，查询*/
    reviewerName: {type: String}, /*审核人姓名，显示*/
    reviewerAvatar: {type: String}, /*审核人头像，显示*/
    reviewerTime: {type: Date}, /*审核时间，记录 查询 统计*/
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
        self.starTime = body.startTime;
        self.endTime = body.endTime;
        self.type = body.type;
        self.content = body.content;
        self.projectID = body.projectID;
        self.projectCName = body.projectCName;
        self.projectEName = body.projectEName;
        self.duration = (Math.abs(body.endTime - body.startTime) / (1000 * 60 * 60)).toFixed(1);
        self.factor = 0;
        self.isChecked = false;
        self.reviewerID = '';
        self.reviewerName = '';
        self.reviewerAvatar = '';
        self.reviewerTime = new Date('1900-01-01 00:00:00');
    } catch (err) {
        throw new DataVerifyError("415", err);
    }
}

JobLogSchema.methods.reviewVerify = function (body) {
    if (_.isUndefined(body)) {
        return false;
    }

    if (_.isUndefined(body.reviewerID) ||
        _.isUndefined(body.reviewerName)
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
        _.isUndefined(body.starTime) ||
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