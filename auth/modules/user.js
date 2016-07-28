/**
 * Created by FanTaSyLin on 2016/7/26.
 */
"use strict";

var debug = require('debug')('app: ' + process.pid);
var mongoose = require('mongoose');
var md5 = require("md5");
var _ = require('lodash');
var saltHelp = require('../lib/salthelp.js');
var Schema = mongoose.Schema;


var UserSchema = new Schema({
    username : {
        type : String,
        unique : true,
        required: true
    },
    password : {
        type : String,
        required : true
    },
    salt : {
        type : String,
        required : true
    },
    headUrl : {
        type : String
    },
    sex : {
        type : String
    },
    birthday : {
        type : String
    }
},{
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true
    }
});


UserSchema.pre('save', function (next) {
    var user = this;
    if (this.isModified('password') || this.isNew) {
        debug('add salt');
        user.salt = saltHelp.create();
        debug('salt: %s', user.salt);
        var pwdd = md5(user.password + user.salt);
        user.password = pwdd;
        debug('new password: %s', user.password);
        return next();
    } else {
        return next();
    }
});

UserSchema.methods.comparePassword = function (orgPassword, cb) {
    debug('comparePassword');
    try {
        var pwdd = md5(orgPassword + this.salt);
        debug('md5(orgPassword + this.salt) = %s', pwdd);
        var isMatch = _.isEqual(pwdd, this.password);
        return cb(null, isMatch);
    } catch (err) {
        return cb(err);
    }
};

UserSchema.methods.createNewPassword = function (Password) {
    debug('createNewPassword');
    this.salt = saltHelp.create();
    var pwdd = md5(Password + this.salt);
    this.password = pwdd;
}

module.exports = mongoose.model('User', UserSchema);