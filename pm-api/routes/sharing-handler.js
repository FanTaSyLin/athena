/**
 * Created by FanTaSyLin on 2017/2/15.
 */

(function () {

    "use strict";

    var _ = require("lodash");
    var moment = require("moment");
    var ContentSharingSchema = require("./../modules/contentsharing-schema.js");
    var ParamProviderError = require("./../errors/ParamProviderError.js");
    var DBOptionError = require("./../errors/DBOptionError.js");

    module.exports = function (server, BASEPATH) {

        /**
         * @typedef {attachments} 附件
         * @property {string} name 附件名称 
         * @property {string} type 附件类型
         * @property {string} description 附件描述
         * @property {string} url 链接
         */

        /**
         * 
         * @typedef {range} 可见范围
         * @property {string} type (global, department, project, private)
         * @property {string} params 
         */

        /**
         * @description 提交新的分享内容
         * @param {string} body.authorID - 作者账号 (必须)
         * @param {string} body.authorName - 作者姓名 (必须)
         * @param {string} body.title - 内容标题 (必须)
         * @param {string} body.content - 内容 (必须)
         * @param {attachments[]} body.attachments - 附件 
         * @param {string[]} body.tags - 标签
         * @param {range[]} body.ranges - 可见范围
         */
        server.post({
            path: BASEPATH + "/sharing/new",
            version: "0.0.1",
        }, _submitNewContent);

        /**
         * @description 编辑已存在的分享内容
         * @param {string} body._id
         * @param {string} body.authorID - 作者账号 (必须)
         * @param {string} body.authorName - 作者姓名 (必须)
         * @param {string} body.title - 内容标题 (必须)
         * @param {string} body.content - 内容 (必须)
         * @param {attachments[]} body.attachments - 附件 
         * @param {string[]} body.tags - 标签
         * @param {range[]} body.ranges - 可见范围
         */
        server.post({
            path: BASEPATH + "/sharing/edit",
            version: "0.0.1",
        }, _submitEditContent);

        /**
         * @description 删除已存在的分享内容
         * @param {string} _id
         */
        server.post({
            path: BASEPATH + "/sharing/delete",
            version: "0.0.1",
        }, _deleteContent);

        /**
         * @description 设置或取消置顶
         * @param {string} body._id
         * @param {Boolean} body.pinFlg 置顶标记
         */
        server.post({
            path: BASEPATH + "/sharing/pin",
            version: "0.0.1",
        }, _pinSharing);

        /**
         * @description 获取分享列表
         * @param {string} authorid 作者账号
         * @param {string} rangetype 可见范围
         * @param {string} params 以空格分割 (if rangetype=project params=projectids; if rangetype=department params=departmentID; if rangetype=global or rangetype=private params=partyAccounts)
         * @param {string} tags 标签 (以空格分割)
         */
        server.get({
            path: BASEPATH + "/sharing/list",
            version: "0.0.1",
        }, _getContentList);

        /**
         * @description 获取分享详细信息
         * @param {string} _id
         */
        server.get({
            path: BASEPATH + "/sharing/detail",
            version: "0.0.1",
        }, _getSharingDetail);

        /**
         * @description 获取分享详细信息的内容部分
         * @param {string} _id
         */
        server.get({
            path: BASEPATH + "/sharing/content",
            version: "0.0.1",
        }, _getSharingContent);

    };

    function _getSharingContent(req, res, next) {
        if (_.isUndefined(req.params.id)) {
            return next(new ParamProviderError(415, {
                message: 'Invalid params'
            }));
        }

        var id = req.params.id;

        ContentSharingSchema
            .findOne({
                _id: id
            }, ["content", "title"]).exec(function (err, doc) {

                if (err) {
                    return next(new DBOptionError(415, err));
                }

                res.end(JSON.stringify(doc));

            });
    }

    function _pinSharing(req, res, next) {
        if (_.isUndefined(req.body)) {
            return next(new ParamProviderError(415, {
                message: "body is undefined"
            }));
        }
        var body = req.body;
        ContentSharingSchema
            .update({
                _id: body._id
            }, {
                $set: {
                    pinFlg: body.pinFlg
                }
            }, function (err) {
                if (err) {
                    return next(new DBOptionError(415, err));
                } else {
                    res.end();
                }
            });
    }

    function _deleteContent(req, res, next) {

        if (_.isUndefined(req.body)) {
            return next(new ParamProviderError(415, {
                message: "body is undefined"
            }));
        }

        var body = req.body;

        ContentSharingSchema.remove({
            _id: body._id
        }, function (err) {
            if (err) {
                return next(new DBOptionError(415, err));
            } else {
                res.end();
            }
        });
    }

    function _submitEditContent(req, res, next) {

        if (_.isUndefined(req.body)) {
            return next(new ParamProviderError(415, {
                message: "body is undefined"
            }));
        }

        var body = req.body;

        ContentSharingSchema
            .update({
                _id: body._id
            }, {
                $set: {
                    title: body.title,
                    varDate: new Date(),
                    content: body.content
                },
                $push: {
                    logs: {
                        type: 'Edit',
                        logTime: new Date(),
                        msg: '编辑了分享内容。',
                        authorID: body.authorID.toString(),
                        authorName: body.authorName.toString()
                    }
                }
            }, function (err) {
                if (err) {
                    return next(new DBOptionError(415, err));
                } else {
                    res.end();
                }
            });
    }

    function _getSharingDetail(req, res, next) {
        if (_.isUndefined(req.params.id)) {
            return next(new ParamProviderError(415, {
                message: 'Invalid params'
            }));
        }

        var id = req.params.id;

        ContentSharingSchema
            .find({
                _id: id
            }).exec(function (err, doc) {

                if (err) {
                    return next(new DBOptionError(415, err));
                }

                var data = {};
                data.status = "success";
                data.error = null;
                data.doc = doc;

                res.end(JSON.stringify(data));

            });

    }

    function _getContentList(req, res, next) {
        var condition = {};
        if (!_.isUndefined(req.params.authorid)) {
            condition.authorID = req.params.authorid;
        }
        if (!_.isUndefined(req.params.rangetype) && !_.isUndefined(req.params.param)) {
            condition["ranges.type"] = req.params.rangetype;
            condition["ranges.param"] = req.params.param.toString();
        }
        console.log(JSON.stringify(condition));
        ContentSharingSchema
            .find(condition, ["_id", "authorID", "authorName", "tags", "title", "varDate", "pinFlg"])
            .sort({
                "pinFlg": -1,
                "varDate": -1
            })
            .exec(function (err, doc) {
                if (err) {
                    return next(new DBOptionError(415, err));
                }

                var data = {};
                data.status = "success";
                data.error = null;
                data.doc = doc;

                res.end(JSON.stringify(data));

            });
    }

    function _submitNewContent(req, res, next) {

        if (_.isUndefined(req.body)) {
            return next(new ParamProviderError(415, {
                message: "body is undefined"
            }));
        }
        try {
            var contentSchema = new ContentSharingSchema();
            contentSchema.submitInit(req.body);
            contentSchema.save(function (err) {
                if (err) {
                    return next(new DBOptionError(415, err));
                } else {
                    res.end();
                }
            });
        } catch (err) {
            return next(err);
        }

    }

})();