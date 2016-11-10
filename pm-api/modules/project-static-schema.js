/**
 * Created by FanTaSyLin on 2016/11/7.
 */

///<reference path="./../../typings/index.d.ts" />

(function () {

    'use strict';

    var mongoose = require('mongoose');
    var Schema = mongoose.Schema;
    var ProjectStaticSchema = new Schema({
        //项目ID 
        projectID: {type: String},
        //月份 (201609, 201610, 201611 .......)
        month: {type: Number},
        //根据项目成员统计人天数
        staticByMember: [{
            account: {type: String},
            name: {type: String},
            duration_Checked: {type: Number},
            duration_Real: {type: Number}
        }]

    });

    module.exports = mongoose.model('ProejctStatic', ProjectStaticSchema);

})();