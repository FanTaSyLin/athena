/**
 * Created by FanTaSyLin on 2016/7/7.
 */

var shallowCopy = require("./utils.js").shallowCopy;

function MySQLHelp(host, port, uid, pw, dbName) {
    var self = this;
    var mysql = require('mysql');
    var client = mysql.createConnection({
        host: host,
        port: port,
        user: uid,
        password: pw,
        database: dbName
    });

    /**
     * database operations
     * @param {string} cmd
     * @param {Function} callback
     * @param {object} callback.err
     * @param {object} callback.data
     */
    self.query = function (cmd, callback) {
        client.connect(function (err) {
            if (err) {
                callback(err);
                client.end();
                return;
            }
        });
        client.query(cmd, function (err, data) {
            if (err) {
                callback(err, data);
                client.end()
                return;
            }
            callback(err, data);
            client.end();
        });
    }
};

/**
 * create new object
 * @param {string} host
 * @param {Number} port
 * @param {string} uid
 * @param {string} pw
 * @param {string} dbName
 * @returns {MySQLHelp}
 */
exports.createNew = function (options){
    var opt = shallowCopy(options);
    opt.host = opt.host || "localhost";
    opt.port = opt.port || 3306;
    opt.user = opt.uid || "sa";
    opt.password = opt.password || "masterkey";
    opt.database = opt.database || "sys";
    return new MySQLHelp(opt.host, opt.port, opt.user, opt.password, opt.database);
};