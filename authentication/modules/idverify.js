/* 
 *  Create by fantasylin on Mon 11 Jul 2016 09:59:17 AM CST 
 */ 

var assert = require("assert");
var S = require("string");
var md = require("md5");
var mysqlHelp = require("./../../lib/mysqlhelp.js");
var config = require("././auth-config.js");


/**
 * 身份认证
 * @param {String} account
 * @param {String} password
 * @param {Function} cb
 * @param {Error} cb.err
 * @param {Object} cb.data
 * @param {Number} cb.data.status
 * @param {String} cb.data.msg
 * @param {String} cb.data.uid
 */
exports.idVerify = function (account, pwd, cb) {
    assert.ok(cb !== null);
    assert.ok(typeof cb === "function");

    var client = mysqlHelp.createNew(config.mysqlDB);
    var sqlCmd = S("select a.password as password, s.salt as salt from account a left join saltseed s on a.account = s.account where a.account = '{{account}}'").template({
        account: account
    }).s;
    var o = {};
    client.query(sqlCmd, function (err, data) {
        if (err) {
            console.log(err.stack);
            o.status = -1;
            o.msg = err.message;
            o.uid = null;
            cb(err, o);
            return;
        } else {
            if (data.length > 0) {
                var pwdmd5 = data[0].password;
                var salt = data[0].salt;
                if (pwdmd5 == md(pwd + salt)) {
                    o.status = 1;
                    o.msg = "";
                    o.uid = data[0].uid;
                    cb(null, o);
                    return;
                } else {
                    o.status = 0;
                    o.msg = "Invalid password";
                    o.uid = null;
                    cb(null, o);
                    return;
                }
            } else {
                o.status = 0;
                o.msg = "Invalid username";
                o.uid = null;
                cb(null, o);
                return;
            }
        }
    });    
};

/**
 * 验证账户唯一性
 * @param {String} account
 * @param {Function} cb
 * @param {Error} cb.err
 * @param {Object} cb.data
 * @param {Number} cb.data.status
 * @param {String} cb.data.msg
 */
exports.idOnly = function (account, cb) {
    assert.ok(cb !== null);
    assert.ok(typeof cb === "function");

    var client = mysqlHelp.createNew(config.mysqlDB);
    var sqlCmd = S("select account from usrinfo where account = '{{account}}'").template({
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
            if (data.length === 0) {
                o.status = 1;
                o.msg = "User name does not exist";
                cb(null, o);
                return;
            } else {
                o.status = 0;
                o.msg = "User name already exists";
                cb(null, o);
                return;
            }
        }
    });
}
