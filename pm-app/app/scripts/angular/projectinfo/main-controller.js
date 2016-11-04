/**
 * Created by FanTaSyLin on 2016/11/4.
 */

(function () {
    
    'use strict';
    
    angular.module('ProjectInfo')
        .controller('MainController', MainControllerFn);

    MainControllerFn.$inject = ['$location'];

    function MainControllerFn($location) {
        var self = this;

        self.isStarred = false;
        
        self.init = _init;
        self.starred = _starred;
        
        function _init() {

            //TODO: 获取参数修改标题
            var projectID = $location.search().projectid;

        }

        function _starred() {
            self.isStarred = !self.isStarred;
        }
    }
    
})();
