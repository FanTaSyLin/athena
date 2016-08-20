/**
 * Created by FanTaSyLin on 2016/8/20.
 */

var mongoose = require('mongoose');
var DptGroupSchema = require('./departmentgroup-schema.js');
var Schema = mongoose.Schema;

var SysConifgSchema = new Schema({
    name: {type: String},
    /*部门*/
    departments: [{
        id: {type: Number}, /*编号*/
        name: {type: String}, /*名称*/
        group: {type: Number} /*所属分组*/
    }],
    /*部门分组*/
    departmentGroups: [DptGroupSchema],
    /*权限模板*/
    authorityModels: [{
        id: {type: Number},/*编号*/
        name: {type: String},/*名称*/
        authority: [Boolean] /*权限*/
    }]
});

module.exports = mongoose.model('SysConifg', SysConifgSchema);