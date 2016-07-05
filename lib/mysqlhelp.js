/**
 * Created by FanTaSyLin on 2016/6/30.
 */

var mysql = require('mysql');

function MySQLHelp() {
    var self = this;
    self.connection = {};
    self.connect = function (host, uid, pwd, dbname) {
        self.connection = mysql.createConnection({
            host: host,
            user: uid,
            password: pwd,
            database: dbname
        });

    };
}


module.exports = MySQLHelp;