/**
 * Created by FanTaSyLin on 2016/7/29.
 */

var Router = require('express').Router;


module.exports = function () {
    var router = new Router();

    router.route('/login').get(login)

    router.route("/pm-soft").get(startApp);

    router.unless = require('express-unless');

    return router;

};

function login (req, res, next) {
    res.sendfile('app/auth.html');
}

function startApp (req, res, next) {

    res.sendfile('app/pmsoft.html');
}
