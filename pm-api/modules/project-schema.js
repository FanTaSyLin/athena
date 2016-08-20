/**
 * Created by FanTaSyLin on 2016/8/18.
 */

var mongoose = require('mongoose');
var JobLogSchema = require('./joblog-schema.js');
var EmployeeSchema = require('./employee-schema.js');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var ProjectSchema = new Schema({
    id: ObjectId,
    cnName: String,
    enName: String,
    createTime: Date,
    authorID: String,
    authorName: String,
    members: [EmployeeSchema],
    jobLogs: [JobLogSchema]
}, {
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true
    }
});

ProjectSchema.pre('save', function (next) {

});

module.exports = mongoose.model('Project', ProjectSchema);