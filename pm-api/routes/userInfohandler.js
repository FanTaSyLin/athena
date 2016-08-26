/**
 * Created by FanTaSyLin on 2016/8/26.
 */

'use strict';

module.exports = function () {

    var _ = require('lodash');
    var EmployeeSchema = require('./../modules/employee-schema.js');
    var ParamProviderError = require('./../errors/ParamProviderError.js');

    var handler = {
        create: createNewUser
    };

    function createNewUser(req, res, next) {
        if (_.isUndefined(req.body)) {
            return next(new ParamProviderError(415, {
                message: 'Invalid params'
            }));
        }
        var body = req.body;
        var employee = new EmployeeSchema();
        try {
            employee.init(body);
            employee.save(function (err) {
                if (err) {
                    res.send(500, err);
                } else {
                    res.end();
                }
            });

        } catch (err) {
            next(err);
        }
    }

    return handler;
}
