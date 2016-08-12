/**
 * Created by FanTaSyLin on 2016/8/12.
 */

(function () {

    'user strict';

    angular
        .module('PMSoft')
        .config(httpProviderHelp);

    httpProviderHelp.$inject = ['$httpProvider'];

    function httpProviderHelp($httpProvider) {

        $httpProvider.interceptors.push(interceptorFn);

        interceptorFn.$inject = ['$q', '$localStorage', '$cookies', '$location'];

        function interceptorFn($q, $localStorage, $cookies, $location) {

            var interceptor = {
                'request': reqInterceptor,
                'responseError': resErrorInterceptor
            };

            function reqInterceptor(config) {

                config.headers = config.headers || {};

                var token = $cookies.get('token');

                var username = $cookies.get('username');

                $localStorage.username = username;

                if (token) {
                    config.headers.Authorization = 'Bearer ' + token;
                }

                return config;
            }

            function resErrorInterceptor(res) {

                if (res.status === 401 || res.status === 403) {
                    //$location.path('/');
                }
                return $q.reject(res);
            }

            return interceptor;
        }


    }

})();