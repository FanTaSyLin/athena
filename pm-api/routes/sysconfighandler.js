/**
 * Created by FanTaSyLin on 2016/8/20.
 */

module.exports = function () {

    'use strict';

    var _ = require('lodash');
    var ParamProviderError = require('./../errors/ParamProviderError.js');
    var DBOptionError = require('./../errors/DBOptionError.js');
    var SysConfigSchema = require('./../modules/sysconfig-schema.js');

    var sysConfigHandler = {
        insertDptGroup: departmentGroup_Insert,
        getDptGroup: departmentGroup_Get,
        deleteDptGroup: departmentGroup_Delete,
        updateDptGroup: departmentGroup_Update,
        insertDepartment: department_Insert,
        getDepartment: department_Get,
        deleteDepartment: department_Delete
    }

    function department_Delete(req, res, next) {

    }

    function department_Get(req, res, next) {

    }

    function department_Insert(req, res, next) {

    }

    function departmentGroup_Get(req, res, next) {
        try {

            SysConfigSchema.findOne({
                name: 'Shinetek'
            }, 'departmentGroups', function (err, doc) {
                if (err) {
                    return next(new DBOptionError(415, err));
                }
                var result = doc.toObject();
                return res.end(JSON.stringify(result.departmentGroups));

            });

        } catch (err) {
            return res.end(err);
        }
    }

    function departmentGroup_Insert(req, res, next) {
        if (req.body == undefined) {
            return next(new ParamProviderError(415, {
                message: 'Invalid params'
            }));
        }

        var body = JSON.parse(req.body);
        var id = body.id;
        var name = body.name;

        if (_.isNull(id) || _.isNull(name)) {
            return next(new ParamProviderError(415, {
                message: 'Invalid params'
            }));
        }

        var dptGroup = SysConfigSchema.getDptGroupItem(id, name);

        try {
            SysConfigSchema.update({
                name: 'Shinetek'
            }, {
                $push: {
                    "departmentGroups": dptGroup
                }
            }, function (err) {
                if (err) {
                    return next(new DBOptionError(415, err));
                } else {
                    return res.end();
                }
            });
        } catch (err) {
            return next(err);
        }

    }

    function departmentGroup_Delete(req, res, next) {
        if (req.params == undefined) {
            return next(new ParamProviderError(415, {
                message: 'Invalid params'
            }));
        }
        var id = req.params['id'];

        try {
            SysConfigSchema.update({
                name: 'Shinetek'
            }, {
                $pull: {
                    "departmentGroups": {
                        _id: id
                    }
                }
            }, function (err) {
                if (err) {
                    return next(new DBOptionError(415, err));
                } else {
                    return res.end();
                }
            });
        } catch (err) {
            return next(err);
        }


    }

    function departmentGroup_Update(req, res, next) {
        if (req.body == undefined) {
            return next(new ParamProviderError(415, {
                message: 'Invalid params'
            }));
        }

        var body = JSON.parse(req.body);
        var _id = body._id;
        var name = body.name;

        if (_.isNull(_id) || _.isNull(name)) {
            return next(new ParamProviderError(415, {
                message: 'Invalid params'
            }));
        }

        SysConfigSchema.update({
            "name": "Shinetek",
            "departmentGroups._id": _id
        }, {
            $set: {
                'departmentGroups.$.name' : name
            }
        }, function (err) {
            if (err) {
                return next(new DBOptionError(415, err));
            } else {
                return res.end();
            }
        });
    }

    return sysConfigHandler;
}