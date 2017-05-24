/**
 * Created by FanTaSyLin on 2016/8/30.
 */

(function () {

    'use strict';

    angular.module('SharingContent')
        .factory('SharingContentServices', Services);

    Services.$inject = ['$http']

    function Services($http) {

        var BASEPATH = 'http://123.56.135.196:4003/api';

        var self = {
            getSharingContent: _getSharingContent
        }

        return self;

        function _getSharingContent(_id, successFn, errorFn) {
            $http.get(BASEPATH + "/sharing/content?id=" + _id).success(successFn).error(errorFn);
        }
    }

})();