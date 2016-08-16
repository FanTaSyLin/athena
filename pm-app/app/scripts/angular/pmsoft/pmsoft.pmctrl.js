/**
 * Created by FanTaSyLin on 2016/8/12.
 */

(function () {

    'user strict';

    angular
        .module('PMSoft')
        .controller('PMController', PMController);

    PMController.$inject = ['$rootScope'];

    function PMController($rootScope) {
        var self = this;
        self.username = $rootScope.username;
    }


})();