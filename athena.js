/**
 * Created by FanTaSyLin on 2016/6/29.
 */

var express = require('express');
var http = require('http');
var ejs = require('ejs');
var path = require('path');
var app = express();
var server = http.createServer(app);

app.set('port', process.env.PORT || 4001);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('.html', ejs.__express);

/**
 * 加载第三方中间件
 */
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var serveStatic = require('serve-static');
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('cookie-parser')());
app.use(passport.initialize());
app.use(passport.session());
app.use(serveStatic(path.join(__dirname, 'app')));
if (app.get('env') === 'development') {
    app.use(require('errorhandler')());
}

passport.use(new LocalStrategy(
    function (uid, pwd, done) {
               

    }
));

/**
 * Angular启动页
 */
app.get('/', function (req, res) {

});

server.listen(app.get('port'), function () {
    console.log('Athena server listening on port :' + app.get('port'));
});

