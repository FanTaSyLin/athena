/* 
 *  Create by fantasylin on Fri 08 Jul 2016 06:10:44 PM CST 
 */

var assert = require("assert");
var md5 = require("md5");
var S = require("string");
var salthelp = require("./salthelp.js");
var mysqlHelp = require("./../../lib/mysqlhelp.js");
var config = require("././auth-config.js");


exports.signIn = function (account, pwd, cb) {
    assert.ok(cb !== null);
    assert.ok(typeof cb === "function");

    var saltSeed = salthelp.create();
    var pwdmd5 = md5(pwd + saltSeed);
    var client1 = mysqlHelp.createNew(config.mysqlDB);
    var client2 = mysqlHelp.createNew(config.mysqlDB);
    var o = {};

    //保存用户名+pwdmd5+uid
    var sqlCmd1 = S("insert into account (account, password) values('{{account}}', '{{password}}')").template({
        account: account,
        password: pwdmd5
    }).s;
    //保存saltSeed
    var sqlCmd2 = S("insert into saltseed (account, salt) values('{{account}}', '{{salt}}')").template({
        account: account,
        salt: saltSeed
    }).s;

    client1.query(sqlCmd1, function (err, data) {
        if (err) {
            if (err.code === "ER_DUP_ENTRY") {
                o = {
                    status: 0,
                    msg: "Sign in failed"
                };
                cb(null, o);
                return;
            }
            console.log(err.stack);
            o = {
                status: -1,
                msg: err.message
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
