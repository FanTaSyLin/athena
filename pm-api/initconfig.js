/**
 * Created by FanTaSyLin on 2016/8/23.
 */

(function () {

    var SysConfigSchema = require('./modules/sysconfig-schema.js');

    const MONGOOSE_URI = process.env.MONGOOSE_URI || "123.56.135.196/pmsoft";

    var mongoose = require('mongoose');

    mongoose.connect(MONGOOSE_URI, {
        server: {
            auto_reconnect: true,
            poolSize: 100
        }
    });

    mongoose.connection.on('error', function (err) {
        console.log('Mongoose connection error: %s', err.stack);
    });

    mongoose.connection.on('open', function () {
        console.log('Mongoose connected to the PMSoft-Mongo');
    });

    var sysConfig = new SysConfigSchema();

    sysConfig.name = 'Shinetek';


    /*
    sysConfig.departmentGroups = [
        {
            id: 1,
            name: '软件中心'
        }
    ];

    sysConfig.departments = [
        {
            id: 1,
            name: '软件一部',
            group: 1
        },
        {
            id: 2,
            name: '软件二部',
            group: 1
        }
    ];

    sysConfig.authorityModels = [
        {
            id: 1,
            name: '管理员',
            authority: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true,]
        }
    ];
    */

    sysConfig.save(function (err) {
        if (err) {
            console.log(err.stack);
            return;
        } else {
            console.log('successful');
            return;
        }
    });

})();