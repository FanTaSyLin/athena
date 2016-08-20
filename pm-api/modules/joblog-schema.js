/**
 * Created by FanTaSyLin on 2016/8/18.
 */

var mongoose = require('mongoose');
var _ = require('lodash');
var DataVerifyError = require('./../errors/DataVerifyError.js');
var Schema = mongoose.Schema;
var ObjectID = Schema.ObjectId;

var JobLogSchema = new Schema({
    id: ObjectID,
    authorID: String,
    authorName: String,
    authorAvatar: String,
    reportTime: Date,
    starTime: Date,
    endTime: Date,
    type: String,
    duration: Number,
    factor: Number,
    isChecked: Boolean,
    reviewerID: String,
    reviewerName: String,
    content: Buffer
});

JobLogSchema.methods.init = function (body) {
    var self = this;

    if (!verify(body)) {
        throw new DataVerifyError("415", {
            message: 'Invalid JobLog body'
        });
    }

    try {
        self.authorID = body.authorID || '';
        self.authorName = body.authorName || '';
        self.authorAvatar = body.authorAvatar || '';
        self.reportTime = new Date();
        self.starTime = new Date(body.starTime || '1900-01-01 00:00:00');
        self.endTime = new Date(body.endTime || '1900-01-01 00:00:00');
        self.type = body.type || '0';
        self.factor = body.factory || 0;
        self.isChecked = body.isChecked || false;
        self.reviewerID = body.reviewerID || '';
        self.reviewerName = body.reviewerName || '';
        self.content = body.content || '';
        self.duration = Math.abs(self.endTime - self.starTime) / (1000 * 60 * 60).toFixed(1);
    } catch (err) {
        if (!verify(body)) {
            throw new DataVerifyError("415", {
                message: 'Invalid JobLog body'
            });
        }
    }
}

function verify(body) {
    if (_.isNull(body)) {
        return false;
    }

    if (_.isNull(body.authorID) ||
        _.isNull(body.authorName) ||
        _.isNull(body.starTime) ||
        _.isNull(body.endTime)
    ) {
        return false;
    } else {
        return true;
    }

}

module.exports = mongoose.model('JobLog', JobLogSchema);