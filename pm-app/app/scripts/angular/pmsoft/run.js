/**
 * Created by FanTaSyLin on 2016/8/13.
 */

(function () {

    'user strict';

    angular
        .module('PMSoft')
        .run(main);

    main.$inject = ['$']

    function main($rootScope) {

        //TODO: 获取用户权限以及用户信息
        $rootScope.username = 'FantasyLin'

    }

})();