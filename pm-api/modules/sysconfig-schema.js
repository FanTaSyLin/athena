/**
 * Created by FanTaSyLin on 2016/8/20.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SysConfigSchema = new Schema({
    name: {type: String, unique: true},
    /*部门分组*/
    departmentGroups: [{
        id: {type: Number, unique: true}, /*编号*/
        name: {type: String}, /*名称*/
    }],
    /*部门*/
    departments: [{
        id: {type: Number, unique: true}, /*编号*/
        name: {type: String}, /*名称*/
        group: {type: Number} /*所属分组*/
    }],
    /*权限模板*/
    authorityModels: [{
        id: {type: Number, unique: true}, /*编号*/
        name: {type: String}, /*名称*/
        authority: [Boolean] /*权限*/
    }]
});

SysConfigSchema.statics.getDptGroupItem = function (id, name) {
    return {
        id: id,
        name: name
    };
};

SysConfigSchema.statics.getDptItem = function (id, name, groupID) {
    return {
        id: id,
        name: name,
        group: groupID
    };
};

SysConfigSchema.statics.getAuthorityModel = function (id, name, authority) {
    return {
        id: id,
        name: name,
        authority: authority
    };
};

module.exports = mongoose.model('SysConfig', SysConfigSchema);