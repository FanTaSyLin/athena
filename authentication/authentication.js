/**
 * Created by FanTaSyLin on 2016/7/6.
 */

(function () {
    var assert = require('assert');
    var restify = require("restify");
    var mysqlHelp = require("./../lib/mysqlhelp.js");
    var S = require("string");
    var config = require("./../config/auth-config.js");

    var port = process.argv[2] || 4001;

    var server = restify.createServer({
        name: "Authentication-Server"
    });

    server.use(restify.queryParser());
    server.use(restify.bodyParser());
    server.use(restify.CORS());

    var PATH = "/auth";

    /**
     * 验证用户名与密码
     * url ~/verify?u=xxx&p=xxx
     */
    server.get({path: PATH + "/verify"}, function (req, res, next) {
        var account = req.params.u;
        var pwd = req.params.p;
        _verify(account, pwd, function (err, data) {
            if (err) {
                console.log(err.stack);
                res.end(JSON.stringify(data));
                return next;
            } else {
                res.end(JSON.stringify(data));
                return next;
            }
        })
    });

    server.get({path: PATH + "/usrinfo"}, function (req, res, next) {
        var uid = req.params.uid;
        _getUsrInfo(uid, function (err, data) {
            if (err) {
                console.log(err.stack);
                res.end(JSON.stringify(data));
                return next;
            } else {
                res.end(JSON.stringify(data));
                return next;
            }
        });
    });

    server.get({path: PATH}, function (req, res, next) {
        res.end("Hello World");
        return next;
    })

    server.listen(port, function () {
        console.log('%s listening at %s ', server.name, server.url);
    });

    function _verify(account, pwd, cb) {
        assert.ok(cb !== null);
        var o = {};        
        var client = mysqlHelp.createNew(config.mysqlDB.host, config.mysqlDB.port, config.mysqlDB.user, config.mysqlDB.pwd, config.mysqlDB.database);
        var sqlCmd = S("select uid from account where account = '{{account}}' and password = '{{pwd}}'").template({
            account: account,
            pwd: pwd
        }).s;
        client.executeData(sqlCmd, function (err, data) {
            if (err) {
                o = {
                    status: "-1",
                    msg: err.message,
                    uid: null
                };
                cb(err, o);
                return;
            } else {
                if (data.length > 0) {
                    //验证通过
                    o = {
                        status: "1",
                        msg: "",
                        uid: data[0].uid
                    };
                    cb(null, o);
                    return;
                } else {
                    //验证不通过
                    o = {
                        status: "0",
                        msg: "Authentication failed",
                        uid: null
                    };
                    cb(null, o);
                    return;
                }
            }
        })
    }

    function _getUsrInfo(uid, cb) {
        assert.ok(cb !== null);
        var o = {};
        var client = mysqlHelp.createNew(config.mysqlDB.host, config.mysqlDB.port, config.mysqlDB.user, config.mysqlDB.pwd, config.mysqlDB.database);
        var sqlCmd = S("select uid, nickname, icon, sex, birthday " +
            "from usrinfo where uid = '{{uid}}'").template({
            uid: uid
        }).s;
        client.executeData(sqlCmd, function (err, data) {
            if (err) {
                o = {
                    status: "-1",
                    usrInfo: null
                };
                cb(err, o);
                return;
            } else {
                if (data.length > 0) {
                    //验证通过
                    o = {
                        status: "1",
                        msg: "",
                        usrInfo: data[0]
                    };
                    cb(null, o);
                    return;
                } else {
                    //验证不通过
                    o = {
                        status: "0",
                        msg: "Invalid uid",
                        usrInfo: null
                    };
                    cb(null, o);
                    return;
                }
            }
        })
    }

})();

