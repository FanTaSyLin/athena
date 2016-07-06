/**
 * Created by FanTaSyLin on 2016/6/30.
 */

var mysql = require('mysql');

function UserHelp() {
    var self = this;

    self.findOne = function (userObj, callback){
        var connect = mysql.createConnection({
            host: 'localhost',
            
        })
    }

}

module.exports = UserHelp;