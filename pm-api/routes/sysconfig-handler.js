/**
 * Created by FanTaSyLin on 2016/9/5.
 */

'use strict';

var _ = require('lodash');
var ParamProviderError = require('./../errors/ParamProviderError.js');
var DBOptionError = require('./../errors/DBOptionError.js');
var SysConfigSchema = require('./../modules/sysconfig-schema.js');

module.exports = function (server, BASEPATH) {

    server.post({
        path: BASEPATH + '/sysconfig/dptgroup',
        version: '0.0.1'
    }, departmentGroup_Insert);

    server.get({
        path: BASEPATH + '/sysconfig/dptgroup',
        version: '0.0.1'
    }, departmentGroup_Get);

    server.put({
        path: BASEPATH + '/sysconfig/dptgroup/delete',
        version: '0.0.1'
    }, departmentGroup_Delete);

    server.put({
        path: BASEPATH + '/sysconfig/dptgroup/update',
        version: '0.0.1'
    }, departmentGroup_Update);

    server.post({
        path: BASEPATH + '/sysconfig/department',
        version: '0.0.1'
    }, department_Insert);

    server.get({
        path: BASEPATH + '/sysconfig/department',
        version: '0.0.1'
    }, department_Get);

    server.put({
        path: BASEPATH + '/sysconfig/department/delete',
        version: '0.0.1'
    }, department_Delete);

    server.put({
        path: BASEPATH + '/sysconfig/department/update',
        version: '0.0.1'
    }, department_Update);
};

function department_Update(req, res, next) {

}

function department_Delete(req, res, next) {

}

function department_Get(req, res, next) {
    try {

        SysConfigSchema.findOne({
            name: 'Shinetek'
        }, 'departments', function (err, doc) {
            if (err) {
                return next(new DBOptionError(415, err));
            }
            var result = doc.toObject();
            return res.end(JSON.stringify(result.departments));

        });

    } catch (err) {
        return res.end(err);
    }
}

function department_Insert(req, res, next) {
    if (req.body == undefined) {
        return next(new ParamProviderError(415, {
            message: 'Invalid params'
        }));
    }

    var body = JSON.parse(req.body);
    var id = body.id;
    var name = body.name;
    var group = body.group;

    if (id == undefined || name == undefined || group == undefined) {
        return next(new ParamProviderError(415, {
            message: 'Invalid params'
        }));
    }

    var department = SysConfigSchema.getDptItem(id, name, group);

    try {
        SysConfigSchema.update({
            name: 'Shinetek'
        }, {
            $push: {
                "departments": department
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