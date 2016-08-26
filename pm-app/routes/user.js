/**
 * Created by FanTaSyLin on 2016/7/29.
 */

var Router = require('express').Router;


module.exports = function () {
    var router = new Router();

    router.route('/auth').get(auth);

    router.route('/signin').get(signin)

    router.route("/pm-soft").get(startApp);

    router.unless = require('express-unless');

    return router;

};

function signin(req, res, next) {
    res.sendfile('app/signin.html');
}

function auth (req, res, next) {
    res.sendfile('app/auth.html');
}

function startApp (req, res, next) {

    res.sendfile('app/pmsoft.html');
}
