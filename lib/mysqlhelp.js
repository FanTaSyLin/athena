/**
 * Created by FanTaSyLin on 2016/7/7.
 */

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
    self.executeData = function (cmd, callback) {
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
exports.createNew = function (host, port, uid, pw, dbName){
    return new MySQLHelp(host, port, uid, pw, dbName);
};