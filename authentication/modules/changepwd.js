/**
 * Created by fantasylin on 7/11/16.
 */

var assert = require("assert");
var md5 = require("md5");
var S = require("string");
var salthelp = require("./salthelp.js");
var mysqlHelp = require("./../../lib/mysqlhelp.js");
var config = require("./../../config/auth-config.js");


exports.changePwd = function (account, pwd, cb) {
    assert.ok(cb !== null);
    assert.ok(typeof cb === "function");

    var saltSeed = salthelp.create();
    var pwdmd5 = md5(pwd + saltSeed);
    var client1 = mysqlHelp.createNew(config.mysqlDB);
    var client2 = mysqlHelp.createNew(config.mysqlDB);
    var o = {};

    //修改密码
    var sqlCmd1 = S("update account set password = '{{password}}' where account = '{{account}}'").template({
        account: account,
        password: pwdmd5
    }).s;
    //修改saltSeed
    var sqlCmd2 = S("update saltseed set salt = '{{salt}}' where account = '{{account}}'").template({
        account: account,
        salt: saltSeed
    }).s;

    client1.query(sqlCmd1, function (err, data) {
        if (err) {
            console.log(err.stack);
            o = {
                status: -1,
                msg: err.message,
                uid: null
            };
            cb(err, o);
            return;
        } else {
            client2.query(sqlCmd2, function (err, data) {
                if (err) {
                    console.log(err.stack);
                    o = {
                        status: -1,
                        msg: err.message
                    };
                    cb(err, o);
                    return;
                } else {
                    o = {
                        status: 1,
                        msg: ""
                    };
                    cb(null, o);
                    return;
                }
            });
        }
    });

};