/**
 * Created by FanTaSyLin on 2017/02/06.
 * 
 * @description 内容分享
 */

"use strict";

var mongoose = require('mongoose');
var _ = require('lodash');
var DataVerifyError = require('./../errors/DataVerifyError.js');
var Schema = mongoose.Schema;

var ContentSharingSchema = new Schema({
    authorID: { type: String },
    authorName: { type: String },
    authorAvatar: { type: String },
    /**
     * @description 发布时间
     */
    varDate: { type: Date },
    /**
     * @description 隐私标记
     */
    privacyFlg: { type: Boolean },    
    /**
     * @description 标题
     */
    title: { type: String },
    /**
     * @description 内容
     */
    content: { type: String },
    /**
     * @description 置顶标记
     */
    pinFlg: { type: Boolean },
    /**
     * @description 附件
     */
    attachments: [{
        name: { type: String },
        type: { type: String },
        description: { type: String },
        url: { type: String },
    }],

    /**
     * @description 标签
     */
    tags: { type: [String] },

    /**
     * @description 范围(谁能看见)
     * type - 范围类型:
     * 1. global - 任意可见
     * 2. department - 部门可见
     * 3. project - 项目可见
     * 4. private - 私有
     * params - 范围参数:
     * type === global  params 无效
     * type === department params = [departmentName]
     * type === project params = [projectID]
     * type === private params 无效
     */
    ranges: [{
        type: { type: String},
        param:{ type: String } 
    }],

    logs: [{ 
        /**
         * @description 日志类型 New-新建 Add-添加内容等 Edit-编辑了内容 Change-修改了状态
         */
        type: { type: String },
        /**
         * @description 时间戳
         */
        logTime: { type: Date },
        /**
         * @description 日志内容
         */
        msg: { type: String },
        /**
         * @description 编辑人账户
         */
        authorID: { type: String },
        /**
         * @description 编辑人姓名
         */
        authorName: { type: String }
    }]

});

ContentSharingSchema.methods.submitInit = function (body) {
    var self = this;
    if (!_dataVerify(body)) {
        throw new DataVerifyError("415", {
            message: "Invalid data"
        });
    }
    try {
        for (var p in body) {
            self[p] = body[p];
        }
        self.pinFlg = false;
        self.privacyFlg = false;
        self.varDate = new Date();
        self.logs = [];
        self.logs.push({
            type: "New",
            logTime: new Date(),
            msg: "分享了本内容",
            authorID: body.authorID,
            authorName: body.authorName
        }); 
    } catch (err) {
        throw new DataVerifyError("415", err);
    }
};

/**
 * @description 数据有效性检查
 */
function _dataVerify (body) {
    if (_.isNull(body) || _.isUndefined(body)) {
        return false;
    }

    if (_.isUndefined(body.authorID) ||
    _.isUndefined(body.authorName) ||
    _.isUndefined(body.title) ||
    _.isUndefined(body.content)) {
        return false;
    } else {
        return true;
    }
}

module.exports = mongoose.model('ContentSharing', ContentSharingSchema);