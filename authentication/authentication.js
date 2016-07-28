 /**
 * Created by FanTaSyLin on 2016/7/6.
 */

(function () {
    var assert = require('assert');
    var restify = require("restify");
    var signIn = require("./modules/signin.js").signIn;
    var changePwd = require("./modules/changepwd.js").changePwd;
    var verify = require("./modules/idverify.js");
    var usrInfo = require("./modules/usrinfo.js");
        
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
     * url ~/id-verify?u=xxx&p=xxx
     * @return {Object} o
     * @return {Number} o.status -1=error, 0=0 rows, 1=success
     * @return {String} o.msg
     * @return {String} o.uid
     */
    server.get({path: PATH + "/id-verify"}, function (req, res, next) {
        var account = req.params.u;
        var pwd = req.params.p;
        verify.idVerify(account, pwd, function (err, data) {
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

    /**
     * 获取用户信息
     * url ~/usrinfo?uid=xxxx
     * @return {Object} o
     * @return {Number} o.status -1=error, 0=0 rows, 1=success
     * @return {String} o.msg
     * @return {Object} o.usrInfo
     */
    server.get({path: PATH + "/usrinfo"}, function (req, res, next) {
        var uid = req.params.uid;
        usrInfo.getUsrInfo(uid, function (err, data) {
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

    /**
     * 验证用户名是否唯一
     * url ~/uq-verify?u=xxx
     * @return {Object} o
     * @return {Number} o.status -1=error, 1=only, 0=not only
     * @return {String} o.msg
     */
    server.get({path: PATH + "/uq-verify"}, function (req, res, next) {
        var account = req.params.u;
        verify.idOnly(account, function (err, data) {
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

    /**
     * 注册用户
     * url POST ~/sign-in?u=xxxx&p=xxxx
     * @return {Object} o
     * @return {Number} o.status -1=error, 0=用户名重复, 1=注册成功
     * @return {String} o.msg
     * @return {String} o.uid
     */
    server.post({path: PATH + "/sign-in"}, function (req, res, next) {
        var account = req.params.u;
        var pwd = req.params.p;
        signIn(account, pwd, function (err, data) {
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

    /**
     * 修改密码
     * url POST ~/change-pwd?uid=xxxx&orgpwd=xxxx&newpwd=xxxx
     * @return {Object} o
     * @return {Number} o.status -1=error, 0=失败, 1=成功
     * @return {String} o.msg
     * @return {String} o.uid
     */
    server.post({path: PATH + "/change-pwd"}, function (req, res, next) {
        var account = req.params.uid;
        var orgPwd = req.params["orgpwd"];
        var newPwd = req.params["newpwd"];

        verify.idVerify(account, orgPwd, function (err, data) {
            if (err) {
                console.log(err.stack);
                res.end(JSON.stringify(data));
                return next;
            } else {
                changePwd(account, newPwd, function (err, data) {
                    if (err) {
                        console.log(err.stack);
                        res.end(JSON.stringify(data));
                        return next;
                    } else {
                        res.end(JSON.stringify(data));
                        return next;
                    }
                });
            }
        });
    });

    /**
     * 修改用户信息
     * url POST ~/change-usrinfo?uid=xxxx
     * body {
     *  nickname,
     *  iconUrl,
     *  sex,
     *  birthday
     * }
     */
    server.post({path: PATH + "/change-usrinfo"}, function (req, res, next) {
        var o = req.body;
        var account = req.params.uid;
        usrInfo.changeUerInfo(account, o, function (err, data) {
           if (err) {
               res.end(JSON.stringify(err.stack));
               return next;
           } else {
               res.end(JSON.stringify(data));
               return next;
           }
        });
    });


    /**
     * 测试用
     */
    server.get({path: PATH}, function (req, res, next) {
        res.end("Hello World");
        return next;
    });

    server.listen(port, function () {
        console.log('%s listening at %s ', server.name, server.url);
    });

})();

