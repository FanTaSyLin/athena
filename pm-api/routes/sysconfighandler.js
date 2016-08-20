/**
 * Created by FanTaSyLin on 2016/8/20.
 */

module.exports = function () {

    'use strict';

    var _ = require('lodash');
    var ParamProviderError = require('./../errors/ParamProviderError.js');
    var DBOptionError = require('./../errors/DBOptionError.js');
    var SysConfigSchema = require('./../modules/sysconfig-schema.js');
    var DptGroupSchema = require('./../modules/departmentgroup-schema.js');

    var sysConfigHandler = {
        insertDtpGroup: departmentGroup_Insert
    }


    function departmentGroup_Insert(req, res, next) {
        var id = req.params['id'];
        var name = req.params['name']

        if (_.isNull(id) || _.isNull(name)) {
            return next(new ParamProviderError(415, {
                message: 'Invalid params'
            }));
        }

        var dptGroup = new DptGroupSchema();

        try {
            dptGroup.init(id, name);
            SysConfigSchema.update({
                name: 'Shinetek01'
            }, {
                $push: {
                    'departmentGroups': dptGroup
                }
            }, function (err) {
                return next(new DBOptionError(415, err));
            });
        } catch (err) {
            return next(err)
        }

    }

    return sysConfigHandler;
}