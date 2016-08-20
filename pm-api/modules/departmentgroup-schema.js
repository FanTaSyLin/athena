/**
 * Created by FanTaSyLin on 2016/8/20.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DepartmentGroupSchema = new Schema({
    id: {type: Number}, /*编号*/
    groupName: {type: String}, /*名称*/
});

DepartmentGroupSchema.methods.init = function (id, name) {
    this.id = id;
    this.groupName = name;
}

module.exports = mongoose.model('DepartmentGroup', DepartmentGroupSchema);