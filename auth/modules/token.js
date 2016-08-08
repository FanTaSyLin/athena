/**
 * Created by FanTaSyLin on 2016/7/28.
 */

var debug = require('debug')('auth: ' + process.pid);
var mongoose = require('mongoose');
var md5 = require("md5");
var _ = require('lodash');
var saltHelp = require('../lib/salthelp.js');
var Schema = mongoose.Schema;


var TokenSchema = new Schema({
    token: {
        type: String,
        unique: true,
        required: true
    },
    lifetime: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    }
}, {
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true
    }
});

TokenSchema.methods.checkValid = function () {
    var lifttime = new Date(this.lifetime);
    var nowtime = new Date();
    var diff = lifttime - nowtime;
    if (diff > 0) {
        this.isValid = true;
    } else {
        this.isValid = false;
    }
};

TokenSchema.methods.extendLifetime = function () {

};

module.exports = mongoose.model('Token', TokenSchema);