/**
 * Created by fantasylin on 7/11/16.
 */

/**
 * 返回一个给定对象的浅拷贝
 * @public
 * @method  shallowCopy
 * @param   {Object} obj 目标对象
 * @returns {Object} copy 拷贝后的对象
 */
exports.shallowCopy = function shallowCopy(obj) {
    if (!obj) {
        return (obj);
    }
    var copy = {};
    Object.keys(obj).forEach(function (k) {
        copy[k] = obj[k];
    });
    return (copy);
}