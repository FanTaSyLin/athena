/**
 * Created by FanTaSyLin on 2016/10/25.
 */

(function () {

    'use strict';

    var mongoose = require('mongoose');
    var _ = require('lodash');
    var Schema = mongoose.Schema;

    var PermissionSchema = new Schema({
        /*提交工作记录*/
        submitJob: {type: Boolean},
        /*修改工作记录*/
        editJob: {type: Boolean},
        /*删除工作记录*/
        deleteJob: {type: Boolean},
        /*审核工作记录*/
        checkJob: {type: Boolean}
        /**/

    });



})();