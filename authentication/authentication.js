/**
 * Created by FanTaSyLin on 2016/7/6.
 */

(function () {
    var restify = require("restify");
    var mysql = require("mysql");
    var S = require("string");
    var config = require("./config.js");

    var port = process.argv[2] || 4001;

    var server = restify.createServer({
        name: "Authentication-Server"
    });

    server.use(restify.queryParser());
    server.use(restify.bodyParser());
    server.use(restify.CORS());

    var PATH = "/authentication";

    /**
     * 验证用户名与密码
     * url /authentication/user?u=xxx&p=xxx
     */
    server.get({
        path: PATH + "/user",
        version: "0.0.1"
    }, _verify);
    
    server.listen(port, "172.20.10.9", function () {
        console.log('%s listening at %s ', server.name, server.url);
    });

    function _verify(req, res, next) {
        var uid = req.params.u;
        var pwd = req.params.p;
        var connection = mysql.createConnection({
            host: config.mysqlDB.host,
            user: config.mysqlDB.user,
            password: config.mysqlDB.pwd,
            database: config.mysqlDB.database
        });
        connection.connect(function (err) {
            var o = {
                status: "-1",
                errMsg: err.message,
                uid: null
            }
            res.end(JSON.stringify(o));
            console.log(err.stack);
            return next();
        });

        var sqlCmd = S("select uid from account where account = '{{uid}}' and password = '{{pwd}}'").template({
            uid:uid,
            pwd:pwd
        }).s;

        connection.query(sqlCmd, function (err, data) {
            if (err) {
                var o = {
                    status: "-1",
                    msg: err.message,
                    uid: null
                }
                res.send(JSON.stringify(o));
                console.log(err.stack);
                return next();
            } else {
                if (data.length > 0) {
                    //验证通过
                    var o = {
                        status: "1",
                        msg: "",
                        uid: data[0].uid
                    }
                    res.send(JSON.stringify(o));
                    return next();
                } else {
                    //验证不通过
                    var o = {
                        status: "0",
                        msg: "Authentication failed",
                        uid: null
                    }
                    res.send(JSON.stringify(o));
                    return next();
                }
            }
        });

        connection.end();
    }

})();

