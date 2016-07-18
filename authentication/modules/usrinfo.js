/**
 * Created by fantasylin on 7/11/16.
 */

var assert = require("assert");
var S = require("string");
var config = require("././auth-config.js");
var mysqlHelp = require("./../../lib/mysqlhelp.js");
var shallowCopy = require("./../../lib/utils.js").shallowCopy;

/**
 * 获取用户信息
 * @param {String} account
 * @param {Function} cb
 * @param {Error} cb.err
 * @param {Object} cb.data
 * @param {Number} data.status
 * @param {String} data.msg
 * @param {Object} data.usrInfo
 */
exports.getUsrInfo = function (account, cb) {
    assert.ok(cb !== null);
    assert.ok(typeof cb === "function");

    var client = mysqlHelp.createNew(config.mysqlDB);
    var sqlCmd = S("select account, nickname, iconurl, sex, birthday from usrinfo where account = '{{account}}'").template({
        account: account
    }).s;
    var o = {};
    client.query(sqlCmd, function (err, data) {
        if (err) {
            console.log(err.stack);
            o.status = -1;
            o.msg = err.message;
            o.usrInfo = null;
            cb(err, o);
            return;
        } else {
            o.status = 1;
            o.msg = "";
            o.usrInfo = data[0] || {};
            cb(null, o);
            return;
        }
    });
}

exports.changeUerInfo = function (account, newUsrInfo, cb) {
    assert.ok(cb !== null);
    assert.ok(typeof cb === "function");

    var o = {};
    var client1 = mysqlHelp.createNew(config.mysqlDB);
    var client2 = mysqlHelp.createNew(config.mysqlDB);

    var sqlCmd = S("select * from usrinfo where account = '{{account}}'").template({
        account: account
    }).s;
    client1.query(sqlCmd, function (err, data) {
        if (err) {
            cb(err, null);
            return;
        } else {
            if (data.length > 0) {
                var usrInfo = shallowCopy(eval('(' + newUsrInfo + ')'));
                usrInfo.nickname = usrInfo.nickname || data[0].nickname;
                usrInfo.iconUrl = usrInfo.iconUrl || data[0].iconUrl;
                usrInfo.sex = usrInfo.sex || data[0].sex;
                usrInfo.birthday = usrInfo.birthday || data[0].birthday;
                sqlCmd = S("update usrinfo set nickname = '{{nickname}}'" +
                    ", iconurl = '{{iconUrl}}' " +
                    ", sex = {{sex}}" +
                    ", birthday = '{{datetime}}'" +
                    " where account = '{{account}}'").template({
                    nickname:usrInfo.nickname,
                    iconUrl:usrInfo.iconUrl,
                    sex: usrInfo.sex,
                    birthday: usrInfo.birthday,
                    account: account
                }).s;
                client2.query(sqlCmd, function (err, data) {
                    if (err) {
                        cb(err, null);
                        return;
                    } else {
                        o.status = 1;
                        o.msg = "Success";
                        cb(null, o);
                        return;
                    }
                })
            } else {
                o.status = 0;
                o.msg = "Invalid Username";
                cb(null, o);
                return;
            }
        }
    });

}