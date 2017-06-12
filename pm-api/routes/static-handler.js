/**
 * Created by FanTaSyLin on 2017/1/4.
 */

var _ = require('lodash');
var ParamProviderError = require('./../errors/ParamProviderError.js');
var DBOptionError = require('./../errors/DBOptionError.js');
var ProjectStaticSchema = require('./../modules/project-static-schema.js');
var JobLogSchema = require('./../modules/joblog-schema.js');

module.exports = function (server, BASEPATH) {
    /**
     * 获取个人 项目中工作量统计结果,真实的非审核后的（包括：该项目的总工时，该账户在此项目中的总工时）
     */
    server.get({
        path: BASEPATH + '/static/psoneral/realworkdone/:account/:projectid',
        version: '0.0.1'
    }, _personalRealWorkDoneStatic);

    /**
     * 获取员工在某段时间内的工作量在各个项目中的分配情况
     * GET /api/static/member/:account/time-distribution?start={yyyy-MM-dd}&end={yyyy-MM-dd}
     */
    server.get({
        path: BASEPATH + '/static/member/:account/time-distribution'
    }, _getMemberTimeDistribution);

    /**
     * 获取员工在某段时间内在各个项目中的活跃度（个人工时/项目总工时）
     * GET /api/static/member/:account/activity?start={yyyy-MM-dd}&end={yyyy-MM-dd}
     */
    server.get({
        path: BASEPATH + '/static/member/:account/activity'
    }, _getMemberActivityInProject);

    /**
     * 获取员工在某段时间内的工作评价
     * GET /api/static/member/:account/evaluation?start={yyyy-MM-dd}&end={yyyy-MM-dd}
     */
    server.get({
        path: BASEPATH + '/static/member/:account/evaluation'
    }, _getMemberJobEvaluation);
};

function _getMemberJobEvaluation(req, res, next) {
    var account = req.params['account'];
    var start = req.params['start'];
    var end = req.params['end'];

    JobLogSchema
        .aggregate(
            {
                $match: {
                    authorID: account,
                    starTime: {
                        $gte: new Date(start),
                        $lte: new Date(end)
                    }
                }
            },
            {
                $group: {
                    _id: {
                        account: '$authorID'
                    },
                    authorID: {
                        $first: '$authorID'
                    },
                    authorName: {
                        $first: '$authorName'
                    },
                    jobLogCount: {
                        $sum: 1
                    },
                    unreviewedCount: {
                        $sum: {
                            $cond: {
                                if: {$eq: ['$status', 'Pass']},
                                then: 0,
                                else: 1
                            }
                        }
                    },
                    reviewedCount: {
                        $sum: {
                            $cond: {
                                if: {$eq: ['$status', 'Pass']},
                                then: 1,
                                else: 0
                            }
                        }
                    },
                    D_Easy: {
                        $sum: {
                            $cond: {
                                if: {
                                    $and: [
                                        {$eq: ['$difficulty', 0.5]},
                                        {$eq: ['$status', 'Pass']}
                                    ]
                                },
                                then: 1,
                                else: 0
                            }
                        }
                    },
                    D_Normal: {
                        $sum: {
                            $cond: {
                                if: {
                                    $and: [
                                        {$eq: ['$difficulty', 1]},
                                        {$eq: ['$status', 'Pass']}
                                    ]
                                },
                                then: 1,
                                else: 0
                            }
                        }
                    },
                    D_Difficult: {
                        $sum: {
                            $cond: {
                                if: {
                                    $and: [
                                        {$eq: ['$difficulty', 1.5]},
                                        {$eq: ['$status', 'Pass']}
                                    ]
                                },
                                then: 1,
                                else: 0
                            }
                        }
                    },
                    E_Turtle: {
                        $sum: {
                            $cond: {
                                if: {
                                    $and: [
                                        {$eq: ['$efficiency', 0]},
                                        {$eq: ['$status', 'Pass']}
                                    ]
                                },
                                then: 1,
                                else: 0
                            }
                        }
                    },
                    E_Slowly: {
                        $sum: {
                            $cond: {
                                if: {
                                    $and: [
                                        {$eq: ['$efficiency', 0.5]},
                                        {$eq: ['$status', 'Pass']}
                                    ]
                                },
                                then: 1,
                                else: 0
                            }
                        }
                    },
                    E_Normal: {
                        $sum: {
                            $cond: {
                                if: {
                                    $and: [
                                        {$eq: ['$efficiency', 1]},
                                        {$eq: ['$status', 'Pass']}
                                    ]
                                },
                                then: 1,
                                else: 0
                            }
                        }
                    },
                    E_Quickly: {
                        $sum: {
                            $cond: {
                                if: {
                                    $and: [
                                        {$eq: ['$efficiency', 1.5]},
                                        {$eq: ['$status', 'Pass']}
                                    ]
                                },
                                then: 1,
                                else: 0
                            }
                        }
                    },
                    E_Rabbit: {
                        $sum: {
                            $cond: {
                                if: {
                                    $and: [
                                        {$eq: ['$efficiency', 2]},
                                        {$eq: ['$status', 'Pass']}
                                    ]
                                },
                                then: 1,
                                else: 0
                            }
                        }
                    },
                    Q_Invalid: {
                        $sum: {
                            $cond: {
                                if: {
                                    $and: [
                                        {$eq: ['$quality', 0]},
                                        {$eq: ['$status', 'Pass']}
                                    ]
                                },
                                then: 1,
                                else: 0
                            }
                        }
                    },
                    Q_Badest: {
                        $sum: {
                            $cond: {
                                if: {
                                    $and: [
                                        {$eq: ['$quality', 0.25]},
                                        {$eq: ['$status', 'Pass']}
                                    ]
                                },
                                then: 1,
                                else: 0
                            }
                        }
                    },
                    Q_Bad: {
                        $sum: {
                            $cond: {
                                if: {
                                    $and: [
                                        {$eq: ['$quality', 0.5]},
                                        {$eq: ['$status', 'Pass']}
                                    ]
                                },
                                then: 1,
                                else: 0
                            }
                        }
                    },
                    Q_BelowNormal: {
                        $sum: {
                            $cond: {
                                if: {
                                    $and: [
                                        {$eq: ['$quality', 0.75]},
                                        {$eq: ['$status', 'Pass']}
                                    ]
                                },
                                then: 1,
                                else: 0
                            }
                        }
                    },
                    Q_Normal: {
                        $sum: {
                            $cond: {
                                if: {
                                    $and: [
                                        {$eq: ['$quality', 1]},
                                        {$eq: ['$status', 'Pass']}
                                    ]
                                },
                                then: 1,
                                else: 0
                            }
                        }
                    },
                    StdTime: {
                        $sum: {
                            $cond: {
                                if: {$eq: ['$status', 'Pass']},
                                then: {$multiply: ['$duration', '$factor']},
                                else: 0
                            }
                        }
                    },
                    RealTime: {
                        $sum: {
                            $cond: {
                                if: {$eq: ['$status', 'Pass']},
                                then: '$duration',
                                else: 0
                            }
                        }
                    }
                }
            }
        )
        .exec(function (err, doc) {
            if (err) {
                return next(new DBOptionError(415, err));
            }
            var data = {
                status: "success",
                doc: doc
            };
            res.end(JSON.stringify(data));
            next();
        });
}

function _getMemberActivityInProject(req, res, next) {
    var account = req.params['account'];
    var start = req.params['start'];
    var end = req.params['end'];

    JobLogSchema
        .aggregate(
            {
                $match: {
                    starTime: {
                        $gte: new Date(start),
                        $lte: new Date(end)
                    },
                    status: 'Pass'
                },
            },
            {
                $group: {
                    _id: {
                        projectID: '$projectID'
                    },
                    projectCName: {
                        $first: '$projectCName',
                    },
                    projectEName: {
                        $first: '$projectEName',
                    },
                    authorID: {
                        $first: account,
                    },
                    presonal: {
                        $sum: {
                            $cond: {
                                if: {$eq: ['$authorID', account]},
                                then: '$duration',
                                else: 0
                            }
                        }
                    },
                    total: {
                        $sum: '$duration'
                    }
                }
            },
            {
                $match: {
                    presonal: {
                        $gt: 0
                    }
                }
            }
        )
        .exec(function (err, doc) {
            if (err) {
                return next(new DBOptionError(415, err));
            }
            var data = {
                status: "success",
                doc: doc
            };
            res.end(JSON.stringify(data));
            next();
        });
}

function _getMemberTimeDistribution(req, res, next) {
    var account = req.params['account'];
    var startTime = req.params['start'];
    var endTime = req.params['end'];
    JobLogSchema
        .aggregate(
            {
                $match: {
                    authorID: account,
                    status: 'Pass',
                    starTime: {
                        $gte: new Date(startTime),
                        $lte: new Date(endTime)
                    }
                },
            },
            {
                $group: {
                    _id: {
                        projectID: '$projectID'
                    },
                    authorID: {
                        $first: account
                    },
                    projectCName: {
                        $first: '$projectCName',
                    },
                    projectEName: {
                        $first: '$projectEName',
                    },
                    totalReal: {
                        $sum: '$duration'
                    },
                    totalStandard: {
                        $sum: {$multiply: ['$duration', '$factor']}
                    }
                }
            }
        )
        .exec(function (err, doc) {
            if (err) {
                return next(new DBOptionError(415, err));
            }
            var data = {
                status: "success",
                doc: doc
            };
            res.end(JSON.stringify(data));
            next();
        });
}

function _personalRealWorkDoneStatic(req, res, next) {
    var projectIDs = req.params.projectid;
    var account = req.params.account;
    var idList = projectIDs.split(' ');
    var conditions = {};
    if (idList.length > 0) {
        conditions.projectID = {
            $in: idList
        };
    }
    ProjectStaticSchema
        .find(conditions)
        .exec(function (err, doc) {
            var data = {};
            if (err) {
                data.status = 'error';
                data.error = err;
                data.doc = null;
                res.end(JSON.stringify(data));
                return next(err);
            }
            var list = [];
            doc.forEach(function (item) {
                var isExist = false;
                var staticByMemberList = item.staticByMember;
                for (var k = 0; k < list.length; k++) {
                    if (item.projectID === list[k].projectID) {
                        for (var i = 0; i < staticByMemberList.length; i++) {
                            if (staticByMemberList[i].account === account) {
                                list[k].myWorkDone += Number(staticByMemberList[i].duration_Real);
                                list[k].totalWorkDone += Number(staticByMemberList[i].duration_Real);
                            } else {
                                list[k].totalWorkDone += Number(staticByMemberList[i].duration_Real);
                            }
                        }
                        isExist = true;
                        break;
                    }
                }
                if (!isExist) {
                    var staticObj = {
                        projectID: '',
                        totalWorkDone: 0,
                        myWorkDone: 0
                    };
                    staticObj.projectID = item.projectID;
                    for (var i = 0; i < staticByMemberList.length; i++) {
                        if (staticByMemberList[i].account === account) {
                            staticObj.myWorkDone += Number(staticByMemberList[i].duration_Real);
                            staticObj.totalWorkDone += Number(staticByMemberList[i].duration_Real);
                        } else {
                            staticObj.totalWorkDone += Number(staticByMemberList[i].duration_Real);
                        }
                    }
                    list.push(staticObj);
                }
            });
            data.status = 'success';
            data.doc = list;
            res.end(JSON.stringify(data));
            return next();
        });
}