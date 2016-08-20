/**
 * Created by FanTaSyLin on 2016/8/19.
 */

'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var EmployeeSchema = new Schema({
    /*账户*/
    account: {type: String},
    /*姓名*/
    name: {type: String},
    /*头像*/
    avatar: {type: String},
    /*部门*/
    department: {
        /*部门 ID*/
        id: {type: Number},
        /*部门 描述*/
        name: {type: Number},
    },
    /*权限*/
    authority: {type: [Boolean]},
    /*手机*/
    mobile: {type: String},
    /*座机*/
    officeTel: {type: String}
});


module.exports = mongoose.model('Employee', EmployeeSchema);
