/**
 * Created by FanTaSyLin on 2016/8/12.
 */

(function () {

    'user strict';

    angular
        .module('PMSoft')
        .controller('PMController', PMController);

    PMController.$inject = ['$cookies'];

    function PMController($cookies) {
        var self = this;
        self.username = $cookies.get('username');
    }


})();